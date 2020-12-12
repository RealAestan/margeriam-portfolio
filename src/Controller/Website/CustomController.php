<?php

declare(strict_types=1);

namespace App\Controller\Website;

use App\Entity\Contact;
use App\Form\Type\ContactType;
use Sulu\Bundle\MediaBundle\Api\Media;
use Sulu\Bundle\MediaBundle\Media\Exception\FileVersionNotFoundException;
use Sulu\Bundle\WebsiteBundle\Controller\DefaultController;
use Sulu\Component\Content\Compat\StructureInterface;
use Symfony\Component\Cache\Adapter\AdapterInterface;

class CustomController extends DefaultController
{
    private $cache;

    public function __construct(AdapterInterface $cache)
    {
        $this->cache = $cache;
    }

    protected function getAttributes($attributes, StructureInterface $structure = null, $preview = false)
    {
        $contact = new Contact();
        $form = $this->createForm(ContactType::class, $contact, [
            'action' => $this->generateUrl('contact'),
            'method' => 'POST',
        ]);
        $attributes = parent::getAttributes($attributes, $structure, $preview);
        $attributes['contactForm'] = $form->createView();

        $localPath = $this->getParameter('sulu_media.media.storage.local.path');
        if (key_exists('content', $attributes) && key_exists('content', $attributes['content'])) {
            foreach ($attributes['content']['content'] as $key => $block) {
                if ($block['type'] === 'imageGallery') {
                    $itemGallery = $this->cache->getItem($attributes['id'].'_'.$key.'_gallery');
                    if (!$itemGallery->isHit()) {
                        $images = [];
                        /** @var Media $image */
                        foreach ($block['images'] as $image) {
                            try {
                                $fileVersion = $image->getFileVersion();
                            } catch (FileVersionNotFoundException $exception) {
                                continue;
                            }
                            $storageOptions = $fileVersion->getStorageOptions();
                            $item = $this->cache->getItem($storageOptions['fileName'].'_dimensions');
                            if (!$item->isHit()) {
                                $path = \implode('/', \array_filter([$localPath, $storageOptions['segment'], $storageOptions['fileName']]));
                                $dimensions = getimagesize($path);
                                $item->set($dimensions);
                                $this->cache->save($item);
                            }
                            $dimensions = $item->get();
                            $images[] = new \App\Entity\Media($image, $dimensions[0], $dimensions[1]);
                        }
                        $itemGallery->set($images);
                        $this->cache->save($itemGallery);
                    }
                    $images = $itemGallery->get();
                    $attributes['content']['content'][$key]['images'] = $images;
                }
            }
        }

        return $attributes;
    }
}
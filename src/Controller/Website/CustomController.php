<?php

declare(strict_types=1);

namespace App\Controller\Website;

use App\Entity\Contact;
use App\Form\Type\ContactType;
use Sulu\Bundle\MediaBundle\Api\Media;
use Sulu\Bundle\MediaBundle\Media\Exception\FileVersionNotFoundException;
use Sulu\Bundle\MediaBundle\Media\Storage\StorageInterface;
use Sulu\Bundle\WebsiteBundle\Controller\DefaultController;
use Sulu\Component\Content\Compat\StructureInterface;

class CustomController extends DefaultController
{
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
                    $images = [];
                    /** @var Media $image */
                    foreach ($block['images'] as $image) {
                        try {
                            $fileVersion = $image->getFileVersion();
                        } catch (FileVersionNotFoundException $exception) {
                            continue;
                        }
                        $storageOptions = $fileVersion->getStorageOptions();
                        $path = \implode('/', \array_filter([$localPath, $storageOptions['segment'], $storageOptions['fileName']]));
                        $dimensions = getimagesize($path);
                        $images[] = new \App\Entity\Media($image, $dimensions[0], $dimensions[1]);
                    }
                    $attributes['content']['content'][$key]['images'] = $images;
                }
            }
        }

        return $attributes;
    }
}
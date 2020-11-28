<?php

declare(strict_types=1);

namespace App\Controller\Website;

use App\Entity\Contact;
use App\Form\Type\ContactType;
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

        return $attributes;
    }
}
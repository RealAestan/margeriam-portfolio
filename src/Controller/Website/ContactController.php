<?php

namespace App\Controller\Website;

use App\Entity\Contact;
use App\Form\Type\ContactType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Contracts\Translation\TranslatorInterface;

class ContactController extends AbstractController
{
    public function indexAction(Request $request, \Swift_Mailer $mailer, TranslatorInterface $translator)
    {
        $contact = new Contact();
        $form = $this->createForm(ContactType::class, $contact, [
            'action' => $this->generateUrl('contact'),
            'method' => 'POST',
        ]);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            /** @var Contact $contact */
            $contact = $form->getData();

            $session = $request->getSession();
            if (!$session->has('date_allow_message') || $session->get('date_allow_message') < new \DateTime()) {
                $email = new \Swift_Message();
                $email->setTo('ms.valeri@protonmail.com');
                $email->setFrom($contact->getEmailAddress());
                $email->setBody($contact->getMessage());
                $result = $mailer->send($email);
                if ($result !== 0) {
                    $date = new \DateTime('+5 minutes');
                    $session->set('date_allow_message', $date);
                    $this->addFlash('success', $translator->trans('message_success'));
                } else {
                    $this->addFlash('error', $translator->trans('message_error'));
                }
            } else {
                $this->addFlash('warning', $translator->trans('message_warning'));
            }
        }
        return $this->redirect($request->headers->get('referer'));
    }
}
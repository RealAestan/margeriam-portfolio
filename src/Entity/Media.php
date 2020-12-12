<?php

namespace App\Entity;

use Sulu\Bundle\MediaBundle\Api\Media as BaseMedia;

class Media extends BaseMedia
{
    private $width;
    private $height;

    public function __construct(BaseMedia $media, int $width, int $height)
    {
        parent::__construct($media->entity, $media->locale, $media->version);
        $this->url = $media->url;
        $this->formats = $media->formats;
        $this->additionalVersionData = $media->additionalVersionData;
        $this->fileVersion = $media->fileVersion;
        $this->localizedMeta = $media->localizedMeta;
        $this->file = $media->file;
        $this->width = $width;
        $this->height = $height;
    }

    public function getWidth()
    {
        return $this->width;
    }

    public function getHeight()
    {
        return $this->height;
    }
}

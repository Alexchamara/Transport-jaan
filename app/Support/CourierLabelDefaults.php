<?php

namespace App\Support;

class CourierLabelDefaults
{
    public static function settings(): array
    {
        return [
            'defaults' => [
                'domestic' => [
                    'templateId' => null,
                    'sizeId' => null,
                ],
                'logistic' => [
                    'templateId' => null,
                    'sizeId' => null,
                ],
            ],
            'printPolicy' => [
                'bulkAsyncThreshold' => 50,
                'bulkHardLimit' => 200,
                'allowCustomSizes' => true,
                'allowTemplateUpload' => true,
                'allowHtmlTemplates' => true,
                'allowPdfBackground' => true,
            ],
        ];
    }

    public static function merge(?array $incoming): array
    {
        return array_replace_recursive(self::settings(), is_array($incoming) ? $incoming : []);
    }
}

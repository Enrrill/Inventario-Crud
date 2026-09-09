<?php

namespace App\Services;

class TextNormalizer
{
    public static function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    public static function normalizeName(string $name): string
    {
        return ucwords(strtolower(trim($name)));
    }

    public static function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        if (str_starts_with($digits, '58')) {
            $digits = substr($digits, 2);
        }

        if (str_starts_with($digits, '0')) {
            $digits = substr($digits, 1);
        }

        if (strlen($digits) === 10) {
            return "58({$digits[0]}{$digits[1]}{$digits[2]})-{$digits[3]}{$digits[4]}{$digits[5]}-{$digits[6]}{$digits[7]}{$digits[8]}{$digits[9]}";
        }

        return $phone;
    }

    public static function normalizeSku(string $sku): string
    {
        return strtoupper(trim($sku));
    }

    public static function normalizeText(string $text): string
    {
        return preg_replace('/\s+/', ' ', trim($text));
    }
}

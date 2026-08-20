<?php

namespace App\Services\Identity;

use InvalidArgumentException;

class PhoneNumber
{
    /**
     * Normalize an Ethiopian phone number to E.164 (+251...).
     *
     * @throws InvalidArgumentException
     */
    public static function normalize(string $input): string
    {
        $digits = preg_replace('/[^0-9+]/', '', trim($input)) ?? '';

        if (str_starts_with($digits, '+251')) {
            $rest = substr($digits, 4);
        } elseif (str_starts_with($digits, '251')) {
            $rest = substr($digits, 3);
        } elseif (str_starts_with($digits, '0')) {
            $rest = substr($digits, 1);
        } else {
            $rest = ltrim($digits, '+');
        }

        if (! preg_match('/^[79]\d{8}$/', $rest)) {
            throw new InvalidArgumentException('Invalid Ethiopian phone number.');
        }

        return '+251'.$rest;
    }

    /**
     * Mask for public display, e.g. +25191*****23 -> 09*****123 style.
     */
    public static function mask(string $e164): string
    {
        $local = '0'.substr($e164, 4);

        return substr($local, 0, 2).'*****'.substr($local, -3);
    }
}

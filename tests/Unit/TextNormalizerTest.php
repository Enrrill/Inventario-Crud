<?php

use App\Services\TextNormalizer;

test('normalizeEmail convierte a minusculas y elimina espacios', function () {
    expect(TextNormalizer::normalizeEmail('  TEST@EXAMPLE.COM  '))->toBe('test@example.com');
});

test('normalizeName convierte a formato titulo', function () {
    expect(TextNormalizer::normalizeName('  juan   perez  '))->toBe('Juan Perez');
});

test('normalizeName maneja nombre vacio', function () {
    expect(TextNormalizer::normalizeName(''))->toBe('');
});

test('normalizePhone formatea numero venezolano de 10 digitos', function () {
    expect(TextNormalizer::normalizePhone('4241234567'))->toBe('58(424)-123-4567');
});

test('normalizePhone formatea numero con prefijo 58', function () {
    expect(TextNormalizer::normalizePhone('584241234567'))->toBe('58(424)-123-4567');
});

test('normalizePhone formatea numero con prefijo 0', function () {
    expect(TextNormalizer::normalizePhone('04241234567'))->toBe('58(424)-123-4567');
});

test('normalizePhone retorna original si no tiene 10 digitos', function () {
    expect(TextNormalizer::normalizePhone('123'))->toBe('123');
});

test('normalizeSku convierte a mayusculas y elimina espacios', function () {
    expect(TextNormalizer::normalizeSku('  sku-1234  '))->toBe('SKU-1234');
});

test('normalizeText elimina espacios extra', function () {
    expect(TextNormalizer::normalizeText('  hola   mundo  '))->toBe('hola mundo');
});

test('normalizeText maneja string vacio', function () {
    expect(TextNormalizer::normalizeText(''))->toBe('');
});

test('normalizeText maneja solo espacios', function () {
    expect(TextNormalizer::normalizeText('   '))->toBe('');
});

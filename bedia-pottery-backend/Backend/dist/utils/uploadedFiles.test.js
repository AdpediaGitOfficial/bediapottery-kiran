"use strict";
/**
 * Files uploaded from the dashboard are served, and nothing in the sub-folders of
 * the uploads folder (generated gift vouchers, voucher templates) is reachable.
 *
 * A real express app serves a temporary folder; no mocks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const uploadedFiles_1 = require("./uploadedFiles");
let server;
let port;
let dir;
const get = (urlPath) => new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path: urlPath }, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
});
beforeAll(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uploads-'));
    fs.writeFileSync(path.join(dir, '1795-gift-voucher.jpeg'), 'PICTURE');
    fs.writeFileSync(path.join(dir, 'my photo.jpg'), 'SPACED');
    fs.writeFileSync(path.join(dir, '.hidden'), 'HIDDEN');
    fs.mkdirSync(path.join(dir, 'vouchers'));
    fs.writeFileSync(path.join(dir, 'vouchers', 'voucher-1.pdf'), 'SECRET VOUCHER');
    fs.mkdirSync(path.join(dir, 'templates'));
    fs.writeFileSync(path.join(dir, 'templates', 'gift-voucher-template.pdf'), 'TEMPLATE');
    fs.writeFileSync(path.join(path.dirname(dir), 'outside-uploads.txt'), 'OUTSIDE');
    const app = express();
    app.use('/uploads', (0, uploadedFiles_1.serveUploadedFiles)(dir));
    await new Promise((resolve) => {
        server = app.listen(0, '127.0.0.1', resolve);
    });
    port = server.address().port;
});
afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(path.join(path.dirname(dir), 'outside-uploads.txt'), { force: true });
});
describe('serving uploaded files', () => {
    it('serves a file saved by the upload endpoint', async () => {
        const res = await get('/uploads/1795-gift-voucher.jpeg');
        expect(res.status).toBe(200);
        expect(res.body).toBe('PICTURE');
    });
    it('serves a file whose name has a space in it', async () => {
        const res = await get('/uploads/my%20photo.jpg');
        expect(res.status).toBe(200);
        expect(res.body).toBe('SPACED');
    });
    it('answers 404 for a file that is not there', async () => {
        expect((await get('/uploads/nothing.jpg')).status).toBe(404);
    });
    it('does not serve anything inside a sub-folder', async () => {
        for (const url of [
            '/uploads/vouchers/voucher-1.pdf',
            '/uploads/templates/gift-voucher-template.pdf',
            '/uploads/vouchers/',
            '/uploads/vouchers',
        ]) {
            const res = await get(url);
            expect([url, res.status]).toEqual([url, 404]);
            expect(res.body).not.toContain('SECRET');
            expect(res.body).not.toContain('TEMPLATE');
        }
    });
    it('does not serve a sub-folder written with an encoded slash or backslash', async () => {
        for (const url of [
            '/uploads/vouchers%2Fvoucher-1.pdf',
            '/uploads/vouchers%2fvoucher-1.pdf',
            '/uploads/vouchers%5Cvoucher-1.pdf',
            '/uploads/templates%2Fgift-voucher-template.pdf',
        ]) {
            const res = await get(url);
            expect([url, res.status]).toEqual([url, 404]);
            expect(res.body).not.toContain('SECRET');
        }
    });
    it('does not let a path climb out of the uploads folder', async () => {
        for (const url of [
            '/uploads/..%2Foutside-uploads.txt',
            '/uploads/%2e%2e%2Foutside-uploads.txt',
            '/uploads/../outside-uploads.txt',
            '/uploads/%2e%2e/outside-uploads.txt',
            '/uploads/..%5Coutside-uploads.txt',
        ]) {
            const res = await get(url);
            expect([url, res.body]).not.toEqual([url, 'OUTSIDE']);
            expect(res.status).not.toBe(200);
        }
    });
    it('does not serve hidden files, and ignores a broken encoding', async () => {
        expect((await get('/uploads/.hidden')).status).toBe(404);
        expect((await get('/uploads/%E0%A4%A')).status).toBe(404);
    });
});

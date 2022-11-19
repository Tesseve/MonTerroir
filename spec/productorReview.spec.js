import mongoose from 'mongoose';
import app from '../app.js';
import supertest from 'supertest';
import { generateAccessToken } from '../app/http/controllers/AuthController.js';
import User from '../app/models/user.js';
import { cleanUpDatabase } from './utils.js';
import Review from '../app/models/review.js';
import Productor from '../app/models/productor.js';

describe('Test productor review logic', function() {
    beforeEach(async function() {
        await cleanUpDatabase();
    });
    it('should list all reviews from product', async function() {
        const productor = await Productor.createFake();
        const user = await User.createFake();

        const res = await supertest(app)
            .get('/api/productors/' + productor._id + '/reviews')
            .set('Authorization', 'Bearer ' + generateAccessToken(user))
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body).toEqual(
            expect.objectContaining({
                data: expect.any(Object),
            })
        );
    });

    it('should create a review', async function() {
        const productor = await Productor.createFake();
        const user = await User.createFake();

        const res = await supertest(app)
            .post('/api/productors/' + productor._id + '/reviews')
            .set('Authorization', 'Bearer ' + generateAccessToken(user))
            .send({
                score: 5,
                message: 'test',
                author: user._id,
                productor: productor._id,
            })
            .expect(201)
            .expect('Content-Type', /json/);

        expect(res.body).toEqual(
            expect.objectContaining({
                _id: expect.any(String),
                score: expect.any(Number),
                message: expect.any(String),
                author: expect.any(String),
                productor: expect.any(String),
            })
        );
    });

    it('should not create a review as authenticated but without score', async function() {

        const productor = await Productor.createFake();
        const user = await User.createFake();

        const res = await supertest(app)
            .post('/api/productors/' + productor._id + '/reviews')
            .set('Authorization', 'Bearer ' + generateAccessToken(user))
            .send({
                message: 'test',
            })
            .expect(422)
            .expect('Content-Type', /json/);

    });

    it('should update a review', async function() {
        const productor = await Productor.createFake();
        const user = await User.createFake();

        const review = await Review.create({
            score: 5,
            message: 'test',
            author: user._id,
            productor: productor._id,
        });

        const res = await supertest(app)
            .put('/api/productors/' + productor._id + '/reviews/' + review._id)
            .set('Authorization', 'Bearer ' + generateAccessToken(user))
            .send({
                score: 5,
                message: 'test2',
                author: user._id,
                productor: productor._id,
            })
            .expect(200)
            .expect('Content-Type', /json/);


        expect(res.body).toEqual(
            expect.objectContaining({
                _id: expect.any(String),
                score: expect.any(Number),
                message: expect.any(String),
                author: expect.any(String),
                productor: expect.any(String),
            })
        );
    });

    it('shoud delete a review', async function() {
        const productor = await Productor.createFake();
        const user = await User.createFake();

        const review = await Review.create({
            score: 5,
            message: 'test',
            author: user._id,
            productor: productor._id,
        });

        const res = await supertest(app)
            .delete('/api/productors/' + productor._id + '/reviews/' + review._id)
            .set('Authorization', 'Bearer ' + generateAccessToken(user))
            .expect(204)

        expect(res.body).toEqual({});

        const review2 = await Review.findById(review._id);
        expect(review2).toBeNull();
    });


});

afterAll(async function() {
    await mongoose.disconnect();
});
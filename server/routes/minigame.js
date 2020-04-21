const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');

const Minigame = require('../models/Minigame');
const User = require('../models/User');

// @GET
// PRIVATE
//

router.get('/', async (req, res) => {
    const userId = req.user._id;


    let cities;

    return res.status(200).json({
        success: true,
        message: 'cities loaded..',
        cities,
    });
});

router.post('/', async (req, res) => {

    const userId = '5e9ebb0e94f56e588ca93c92'//req.user._id
    const now = Date.now()
    let minigamesForUser = await Minigame.find({ userId: userId }).sort({ generated: -1 });

    if (minigamesForUser.length === 0) {
        const result = await createNewGame(userId)

        return res.status(200).json({
            success: true,
            message: 'Query generated',
            result: result
        })
    }
    const oldQuery = minigamesForUser[0].query
    const twelveHoursInMS = 1000 * 60 * 60 * 12
    const twelveHoursPassed = minigamesForUser[0].generated + twelveHoursInMS <= now;


    const remainingTimeInMS = minigamesForUser[0].generated + twelveHoursInMS - now

    if (!twelveHoursPassed) {
        return res.status(403).json({
            success: false,
            message: 'You need to wait 12 hours between each game',
            remainingTimeInMS,
            query: oldQuery
        });
    }

    if (minigamesForUser[0].status === 'active') {
        return res.status(403).json({
            success: false,
            message: 'You already have an active query',
            remainingTimeInMS,
            query: oldQuery
        });
    }

    const result = await createNewGame(userId)

    return res.status(200).json({
        success: true,
        message: 'Query generated',
        result: result
    })
});

router.post('/:query', async (req, res) => {
    // todo. ensure useragent and other creds is coming from heroku chessathor
    const query = req.params.query
    const userAgent = req.headers['user-agent']
    console.log(userAgent)

    const minigame = await Minigame.findOne({ query: query })
    const { userId, status } = minigame


    if (status !== 'active') {
        return res.status(403).json({
            success: false,
            message: 'Nice try..',
        });
    }

    const user = await User.findById(userId)
    user.batteryGain(25)

    minigame.status = 'finished';
    minigame.save();

    return res.status(200).json({
        success: true,
        message: 'Query confirmed, battery recharged',
        query,
    });
})


const generateQueryString = () => {
    const lexi = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let query = '';
    for (let i = 0; i < 6; i += 1) {
        query += lexi[Math.floor(Math.random() * lexi.length)]
    }

    return query;
}

const createNewGame = (userId) => {
    const now = Date.now()
    const minigame = new Minigame({
        query: generateQueryString(),
        status: 'active',
        userId: userId,
        generated: now,
    });

    return minigame.save()

}

module.exports = router;

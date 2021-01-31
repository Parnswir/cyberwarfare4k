const express = require('express');

const router = express.Router();
const User = require('../models/User');
const OrgCrime = require('../models/OrgCrime');
const Alliance = require('../models/Alliance');

const { saveAndUpdateUser } = require('../logic/_helpers');
const { commitOrginaziedCrime } = require('../logic/orgCrime');

const findAndCatgeorizeOrgCrimes = async () => {
  const now = Date.now();
  const allOrgCrimes = await OrgCrime.find({ gracePeriod: { $lte: now } }).lean()
    .populate('owner', 'name')
    .populate('ownerAlliance', 'name')
    .populate('roles.owner', 'name');

  const orgCrimes = allOrgCrimes.filter((crime) => !crime.owner);
  const claimedOwnOrgCrimes = allOrgCrimes.filter((crime) => !!crime.owner);

  return { orgCrimes, claimedOwnOrgCrimes };
};

// @GET
// PRIVATE
// Retrives all organized crimes

router.get('/', async (req, res) => {
  /* const userId = req.user._id;
  const user = await User.findById(userId).select('alliance').lean(); */
  const allOrgCrimes = await findAndCatgeorizeOrgCrimes();

  /* IF active until is expired, clean it */

  return res.status(200).json({
    success: true,
    message: 'Organized Crime loaded..',
    orgCrimes: allOrgCrimes.orgCrimes,
    claimedOwnOrgCrimes: allOrgCrimes.claimedOwnOrgCrimes,
  });
});

// @PUT
// PRIVATE
// Claims the organized crime
router.put('/', async (req, res) => {
  const now = Date.now();
  const userId = req.user._id;
  const { crimeId } = req.body;
  const user = await User.findById(userId).select('alliance').lean();
  const orgCrime = await OrgCrime.findById(crimeId);
  orgCrime.claimOwner(user._id, user.alliance, now);
  await orgCrime.save();

  const allOrgCrimes = await findAndCatgeorizeOrgCrimes();

  return res.status(200).json({
    success: true,
    message: 'Organized Crime claimed..',
    orgCrimes: allOrgCrimes.orgCrimes,
    claimedOwnOrgCrimes: allOrgCrimes.claimedOwnOrgCrimes,
  });
});

// @PATCH
// PRIVATE
// Claims the organized crime role
router.patch('/', async (req, res) => {
  const userId = req.user._id;
  const { crimeId, roleName } = req.body;
  const user = await User.findById(userId).select('alliance').lean();
  const orgCrime = await OrgCrime.findById(crimeId);
  orgCrime.claimRole(user._id, roleName);
  await orgCrime.save();

  const allOrgCrimes = await findAndCatgeorizeOrgCrimes();

  return res.status(200).json({
    success: true,
    message: `${orgCrime.name} role ${roleName} claimed..`,
    orgCrimes: allOrgCrimes.orgCrimes,
    claimedOwnOrgCrimes: allOrgCrimes.claimedOwnOrgCrimes,
  });
});

// @PATCH
// PRIVATE
// Carries out organized crime
router.post('/', async (req, res) => {
  const userId = req.user._id;
  const { crimeId } = req.body;
  const orgCrime = await OrgCrime.findById(crimeId).populate('roles.owner');

  const finalResult = await commitOrginaziedCrime(orgCrime);
  orgCrime.cleanCrime();
  await orgCrime.save();

  const allOrgCrimes = await findAndCatgeorizeOrgCrimes();

  return res.status(200).json({
    success: true,
    message: `Organized crime ${orgCrime.name} commited..`,
    orgCrimes: allOrgCrimes.orgCrimes,
    claimedOwnOrgCrimes: allOrgCrimes.claimedOwnOrgCrimes,
  });
});

module.exports = router;

/* eslint-disable func-names */
const mongoose = require('mongoose');
const Message = require('./Message');

const { Schema } = mongoose;

const allianceSchema = new Schema({
  name: {
    type: String,
    required: true,
    enum: ['Black', 'White', 'Red', 'Grey', 'Brown'],
  },
  active: { type: Boolean, default: false },
  invitedMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  boss: { type: Schema.Types.ObjectId, ref: 'User' },
  cto: { type: Schema.Types.ObjectId, ref: 'User' },
  analyst: { type: Schema.Types.ObjectId, ref: 'User' },
  firstLead: { type: Schema.Types.ObjectId, ref: 'User' },
  secondLead: { type: Schema.Types.ObjectId, ref: 'User' },
  firstMonkeys: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  secondMonkeys: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  organizePermission: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  forumModeratorPermission: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

allianceSchema.methods.leaveAlliance = function (playerId) {
  // player.sendNotication

  [
    'firstMonkeys',
    'secondMonkeys',
    'invitedMembers',
    'organizePermission',
    'forumModeratorPermission',
  ].forEach((r) => {
    const playerRoleIndex = this[r].indexOf(playerId);
    if (playerRoleIndex !== -1) {
      this[r].splice(playerRoleIndex, 1);
    }
  });

  ['cto', 'analyst', 'firstLead', 'secondLead'].forEach((r) => {
    if (this[r] === playerId) {
      this[r] = null;
    }
  });

  this.replaceBoss();
};

allianceSchema.methods.replaceBoss = function () {
  if (this.boss) return;
  let replacer;
  switch (true) {
    case !!this.analyst:
      replacer = this.analyst;
      this.analyst = null;
      break;
    case !!this.cto:
      replacer = this.cto;
      this.cto = null;
      break;
    case !!this.firstLead:
      replacer = this.firstLead;
      this.firstLead = null;
      break;
    case !!this.secondLead:
      replacer = this.secondLead;
      this.secondLead = null;
      break;
    case !!this.firstMonkeys.length:
      [replacer] = this.firstMonkeys;
      this.firstMonkeys.shift();
      break;
    case !!this.secondMonkeys.length:
      [replacer] = this.secondMonkeys;
      this.secondMonkeys.shift();
      break;
    default:
      this.abandonAlliance();
  }
  this.boss = replacer;
};

allianceSchema.methods.abandonAlliance = function () {
  console.info('abandon');
};

allianceSchema.methods.inviteMember = function (now, playerId) {
  const text = `You have been invited to join the alliance ${this.name}`;
  const newMessage = new Message({
    from: this.boss,
    to: playerId,
    dateSent: now,
    read: false,
    allianceInvitation: this._id,
    text,
  });
  this.invitedMembers.push(playerId);
  newMessage.save();
};

allianceSchema.methods.declineInvitation = function (playerId) {
  // player.sendNotication
  const playerIndex = this.invitedMembers.indexOf(playerId);
  this.invitedMembers.splice(playerIndex, 1);
};

allianceSchema.methods.acceptInvitation = function (playerId, role) {
  // player.sendNotication

  const invitedPlayerIndex = this.invitedMembers.indexOf(playerId);
  this.invitedMembers.splice(invitedPlayerIndex, 1);

  this[role].push(playerId);
};

allianceSchema.methods.toggleOrganizePermission = function (playerId) {
  // player.sendNotication
  const playerIndex = this.organizePermission.indexOf(playerId);
  if (playerIndex !== -1) {
    this.organizePermission.splice(playerIndex, 1);
  } else {
    this.organizePermission.push(playerIndex);
  }

  this.save();
};

allianceSchema.methods.toggleForumModeratorPermission = function (playerId) {
  // player.sendNotication
  const playerIndex = this.forumModeratorPermission.indexOf(playerId);
  if (playerIndex !== -1) {
    this.forumModeratorPermission.splice(playerIndex, 1);
  } else {
    this.forumModeratorPermission.push(playerIndex);
  }
  this.save();
};

allianceSchema.methods.changeAllianceRole = function (playerId, newPosition) {
  // player.sendNotication
  if (
    ['boss', 'cto', 'analyst', 'firstLead', 'secondLead'].includes(newPosition)
  ) {
    // sees if there is an existing player in the newposition and demotes this user to codemonkeys
    if (this[newPosition]) {
      const randomBool = Math.random() > 0.5;
      if (randomBool) {
        this.firstMonkeys.push(this[newPosition]);
      } else {
        this.secondMonkeys.push(this[newPosition]);
      }
    }
    this[newPosition] = playerId;
  }
  if (['firstMonkeys', 'secondMonkeys'].includes(newPosition)) {
    this[newPosition].push(playerId);
  }
  this.save();
};

allianceSchema.methods.members = function (length = false) {
  const members = [
    this.boss,
    this.cto,
    this.analyst,
    this.firstLead,
    this.secondLead,
    ...this.firstMonkeys,
    ...this.secondMonkeys,
  ].filter(Boolean);
  return length ? members.length : members;
};

module.exports = mongoose.model('Alliance', allianceSchema);

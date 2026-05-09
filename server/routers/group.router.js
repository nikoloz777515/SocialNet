const express = require('express');
const { createGroup, findGroup, getMyGroups, deleteGroup, joinGroup } = require('../controllers/group.controller');
const protect = require('../middlewares/protect.middleware');

const groupRouter = express.Router();

groupRouter.use(protect);

groupRouter.post('/', createGroup);
groupRouter.get('/search', findGroup);
groupRouter.get('/my-groups', getMyGroups);
groupRouter.post('/:groupId/join', joinGroup);
groupRouter.delete('/:groupId', deleteGroup);

module.exports = groupRouter;
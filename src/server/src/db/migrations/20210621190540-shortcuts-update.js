'use strict';
const path = require('path');
// import the DB models so we can run updates on them
const { node, user } = require('../../db/models');
const { Op } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // THIS IS NOT A TRADITIONAL MIGRATION
      // for this one we are updating existing data, and so will have to make queries
      // against the existing database to update the PATH and PREVIEW values for
      // all isFile === true nodes, to store the full path instead of a partial one
      const results = await node.findAll({
        where: { [Op.or]: [{ isFile: true }, { type: 'user' }] },
      });
      // iterate through the results and update the values
      for (let node of results) {
        // get the root of the path, so we can make sure we only update
        // the partial paths stored in older versions of synthona
        const pathRoot = node.preview.substring(0, node.preview.indexOf('/'));
        // make sure we are only updating nodes which have partial paths from the data folder
        if (pathRoot === 'data') {
          console.log(node.name);
          const newPreview = node.preview ? path.join(__coreDataDir, node.preview) : null;
          // const newPath = node.path ? path.join(__coreDataDir, node.path) : newPreview;
          console.log('new path: ' + newPreview + '\n');
          if (node.type !== 'user') {
            // update the node with the new full path
            await node.update(
              {
                preview: newPreview,
                path: newPreview,
              },
              { where: { id: node.id }, silent: true }
            );
          } else {
            // for user nodes we only update the preview
            await node.update(
              {
                preview: newPreview,
              },
              { where: { id: node.id }, silent: true }
            );
          }
        }
      }
      // do the same thing for all user DB entries in the user table
      const users = await user.findAll();
      // iterate through the results and update the values
      for (let user of users) {
        //   get the root of the path for avatar & header images, so we can make sure we only update
        //  the partial paths stored in older versions of synthona
        const userData = user.dataValues;
        const avatarRootPath = userData.avatar.substring(0, userData.avatar.indexOf('/'));
        const headerRootPath = userData.header.substring(0, userData.header.indexOf('/'));
        // make sure we are only updating nodes which need to be updated
        if (avatarRootPath === 'data') {
          const newAvatar = userData.avatar ? path.join(__coreDataDir, userData.avatar) : null;
          console.log('new avatar: ' + newAvatar);
          // update the user avatar with the new file path
          await user.update(
            {
              avatar: newAvatar,
            },
            { where: { id: node.id }, silent: true }
          );
        }
        if (headerRootPath === 'data') {
          const newHeader = userData.header ? path.join(__coreDataDir, userData.header) : null;
          console.log('new header: ' + newHeader + '\n');
          // update the user header with the new file path
          await user.update(
            {
              header: newHeader,
            },
            { where: { id: node.id }, silent: true }
          );
        }
      }
      console.log('SHORTCUTS-UPDATE MIGRATION COMPLETED');
    } catch (err) {
      console.log(err);
      const error = new Error('there was a problem running the shortcuts-update migration');
      error.statusCode = 404;
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('UNDOING SHORTCUTS UPDATE MIGRATION');
      // THIS IS NOT A TRADITIONAL MIGRATION
      // in order to revert it, we are simply taking full file paths and turning them back into
      // paths which start at the data/ folder again. probably this will never be run
      // except for testing purposes, but it's probably better to have it in here anyways
      const results = await node.findAll({
        where: { [Op.or]: [{ isFile: true }, { type: 'user' }] },
      });
      // loop through the results
      for (let node of results) {
        const pathRoot = node.preview.substring(0, node.preview.indexOf('/'));
        // make sure we are only reverting nodes which need to be reverted
        if (pathRoot !== 'data') {
          console.log(node.name);
          const previewPath = node.preview;
          // const newPreview = node.preview ? path.join(__coreDataDir, node.preview) : null;
          const revertedPath = previewPath.substring(previewPath.lastIndexOf('data'));
          console.log(revertedPath + '\n');
          if (node.type !== 'user') {
            await node.update(
              {
                preview: revertedPath,
                path: revertedPath,
              },
              { where: { id: node.id }, silent: true }
            );
          } else {
            await node.update(
              {
                preview: revertedPath,
              },
              { where: { id: node.id }, silent: true }
            );
          }
        }
      }
      // do the same thing for all user DB entries in the user table
      const users = await user.findAll();
      // iterate through the results and update the values
      for (let user of users) {
        //   get the root of the path for avatar & header images, so we can make sure we only update
        //  the partial paths stored in older versions of synthona
        const userData = user.dataValues;
        const avatarRootPath = userData.avatar.substring(0, userData.avatar.indexOf('/'));
        const headerRootPath = userData.header.substring(0, userData.header.indexOf('/'));
        // make sure we are only updating nodes which need to be updated
        if (avatarRootPath !== 'data') {
          const revertedAvatar = userData.avatar.substring(userData.avatar.lastIndexOf('data'));
          console.log(revertedAvatar + '\n');
          // update the user avatar with the reverted file path
          await user.update(
            {
              avatar: revertedAvatar,
            },
            { where: { id: node.id }, silent: true }
          );
        }
        if (headerRootPath !== 'data') {
          const revertedHeader = userData.header.substring(userData.header.lastIndexOf('data'));
          console.log(revertedHeader + '\n');
          // update the user avatar with the reverted file path
          await user.update(
            {
              header: revertedHeader,
            },
            { where: { id: node.id }, silent: true }
          );
        }
      }
    } catch (err) {
      console.log(err);
      const error = new Error('there was a problem undoing the shortcuts-update migration');
      error.statusCode = 404;
      throw error;
    }
  },
};

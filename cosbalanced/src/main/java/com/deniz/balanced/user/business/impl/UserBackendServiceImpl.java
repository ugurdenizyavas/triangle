package com.deniz.balanced.user.business.impl;

import com.deniz.balanced.framework.business.impl.AbstractBackendService;
import com.deniz.balanced.framework.dao.FrameworkDao;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.business.exception.AncestorInviteLimitReachedException;
import com.deniz.balanced.user.business.exception.DataAlreadyExistException;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.business.exception.PasswordWrongException;
import com.deniz.balanced.user.persistence.UserDao;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;

import java.util.ArrayList;
import java.util.List;

public class UserBackendServiceImpl extends AbstractBackendService<UserEntity> implements UserBackendService {

    protected final Logger logger = LoggerFactory.getLogger(getClass());

    private String baseInvitationLimit;
    private UserDao dao;

    @Required
    public void setBaseInvitationLimit(String baseInvitationLimit) {
        this.baseInvitationLimit = baseInvitationLimit;
    }

    @Required
    public void setDao(UserDao dao) {
        this.dao = dao;
    }

    @Override
    protected FrameworkDao<UserEntity> getDao() {
        return this.dao;
    }

    @Override
    public List<UserEntity> getAncestorEntities(Long userId) throws NotValidIdException {
        Validate.notNull(userId);
        List<UserEntity> ancestors = new ArrayList<UserEntity>();
        return getAncestorsRecursive(getById(userId), ancestors);
    }

    @Override
    public UserEntity getAncestorByCurrentId(long userId) throws NotValidIdException {
        Validate.notNull(userId);
        UserEntity currentUser = getById(userId);
        return currentUser.getAncestor();
    }

    @Override
    public UserEntity getByEmail(String email) {
        Validate.notNull(email);
        return this.dao.getByEmail(email);
    }

    @Override
    public UserEntity getByReference(String reference) {
        Validate.notNull(reference);
        return this.dao.getByReference(reference);
    }

    @Override
    public void login(long userId, String password) throws PasswordWrongException, NotValidIdException {
        Validate.notNull(userId);
        Validate.notNull(password);
        UserEntity userEntity = getById(userId);
        if (!StringUtils.equals(userEntity.getPassword(), password)) {
            this.logger.debug("User " + userEntity.getSimpleName() + " and password " + password + "does not match.");
            throw new PasswordWrongException();
        } else {
            this.logger.debug("User " + userEntity.getSimpleName() + " has logged in");
        }
    }

    @Override
    public void changePassword(long userId, String oldPassword, String newPassword) throws PasswordWrongException, NotValidIdException {
        Validate.notNull(userId);
        Validate.notNull(oldPassword);
        Validate.notNull(newPassword);

        UserEntity userEntity = getById(userId);
        String username = userEntity.getSimpleName();
        if (!StringUtils.equals(userEntity.getPassword(), oldPassword)) {
            this.logger.info("User " + username + " and password " + oldPassword + "does not match.");
            throw new PasswordWrongException();
        } else {
            userEntity.setPassword(newPassword);
            try {
                save(userEntity);
            } catch (DataAlreadyExistException e) {
                throw new RuntimeException("This is a coding error. Name, email or reference should not be changed.");
            }
            this.logger.info("Password of user " + username + " has been changed.");
        }
    }

    @Override
    public void newUser(UserEntity user) {
        Validate.notNull(user);
        try {
            save(user);
        } catch (DataAlreadyExistException e) {
            this.logger.error("Programming error. This is first user; data should not be already existed.");
        }
    }

    @Override
    public List<UserEntity> getChildren(long userId) throws NotValidIdException {
        Validate.notNull(userId);
        UserEntity user = getById(userId);
        return this.dao.getChilds(user);
    }

    private List<UserEntity> getAncestorsRecursive(UserEntity currentUser, List<UserEntity> ancestors) throws NotValidIdException {
        if ((currentUser == null)) {
            return ancestors;
        } else {
            ancestors.add(currentUser);
            if (currentUser.getAncestor() == null) {
                return ancestors;
            }
        }

        return getAncestorsRecursive(getAncestorByCurrentId(currentUser.getId()), ancestors);
    }

    @Override
    public void checkInvitationLimit(long userId) throws NotValidIdException, AncestorInviteLimitReachedException {
        int childrenCount = getChildren(userId).size();
        // Children count can't exceed baseInvitationLimit and user's level
        if (childrenCount >= Integer.parseInt(this.baseInvitationLimit)) {
            UserEntity user = getById(userId);
            if (childrenCount >= user.getCurrentLevel()) {
                throw new AncestorInviteLimitReachedException();
            }
        }
    }

    @Override
    public List<String> getValidReferences() {
        return this.dao.getAllType("reference");
    }
}

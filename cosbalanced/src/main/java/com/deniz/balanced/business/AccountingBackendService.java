package com.deniz.balanced.business;

import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.persistence.entity.UserEntity;

import java.util.List;

public interface AccountingBackendService {

	/**
	 * Add money of membership to this user and its ancestors
	 * 
	 * @param userId
	 *            id of inviter user
	 * @param moneyAmount
	 *            amount of money required for membership
	 * @throws com.deniz.balanced.user.business.exception.NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void addMoney(long userId, double moneyAmount) throws NotValidIdException;

	/**
	 * Withdraw amount of money from user with id
	 *
	 * @param userId
	 *            id of user
	 * @param moneyAmount
	 *            amount of money
	 * @throws com.deniz.balanced.user.business.exception.NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void withdrawMoney(long userId, double moneyAmount) throws NotValidIdException;

	/**
	 * Get user entities listed by their wealths
	 * 
	 * @return user list
	 */
	List<UserEntity> getUsersSortWealth();

}

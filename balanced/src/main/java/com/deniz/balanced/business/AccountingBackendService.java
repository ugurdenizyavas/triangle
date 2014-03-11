package com.deniz.balanced.business;

import java.util.List;

import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.persistence.entity.UserEntity;

public interface AccountingBackendService {

	/**
	 * Add money of membership to this user and its ancestors
	 * 
	 * @param userId
	 *            id of inviter user
	 * @param moneyAmount
	 *            amount of money required for membership
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void addMoney(long userId, double moneyAmount) throws NotValidIdException;

	/**
	 * Withdraw amount of money from user with id
	 * 
	 * @param id
	 *            id of user
	 * @param parseDouble
	 *            amount of money
	 * @throws NotValidIdException
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

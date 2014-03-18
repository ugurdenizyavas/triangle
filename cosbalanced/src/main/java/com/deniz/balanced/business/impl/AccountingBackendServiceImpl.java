package com.deniz.balanced.business.impl;

import com.deniz.balanced.business.AccountingBackendService;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.persistence.UserDao;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

public class AccountingBackendServiceImpl implements AccountingBackendService {

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	private UserDao userDao;
	private UserBackendService userBackendService;

	@Required
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	@Required
	public void setUserBackendService(UserBackendService userBackendService) {
		this.userBackendService = userBackendService;
	}

	@Override
	public void addMoney(long userId, double moneyAmount) throws NotValidIdException {
		Validate.notNull(userId);
		Validate.notNull(moneyAmount);
		earnMoney(userId, 2.0);
		moneyAmount += -2.0;

		List<UserEntity> ancestors = this.userBackendService.getAncestorEntities(userId);
		Map<Long, Double> moneyMap = new HashMap<Long, Double>();
		Double totalMultiplier = 0.0;
		for (int i = 0; i < ancestors.size(); i++) {
			UserEntity ancestor = ancestors.get(i);
			Integer heritageDegree = i + 1;
			Integer level = ancestor.getCurrentLevel();
			Long ancestorId = ancestor.getId();
			double ust = level * Math.sqrt(level);
			int alt = (heritageDegree * heritageDegree) * heritageDegree;
			Double moneyMultiplier = ust / alt;
			totalMultiplier += moneyMultiplier;
			moneyMap.put(ancestorId, moneyMultiplier);

		}

		double unitMoney = moneyAmount / totalMultiplier;
		Iterator<Entry<Long, Double>> it = moneyMap.entrySet().iterator();
		while (it.hasNext()) {
			Entry<Long, Double> moneyBag = it.next();
			Double moneyMultiplier = moneyBag.getValue();
			Double moneyEarned = 0.0;
			moneyEarned = unitMoney * moneyMultiplier;
			earnMoney(moneyBag.getKey(), moneyEarned);
		}
	}

	private void earnMoney(long userId, Double moneyEarned) throws NotValidIdException {
		UserEntity luckyUser = this.userBackendService.getById(userId);
		Double currentBalance = luckyUser.getBalance();
		Double newBalance = currentBalance + moneyEarned;
		luckyUser.setBalance(newBalance);
		this.userBackendService.update(luckyUser);
	}

	@Override
	public void withdrawMoney(long userId, double moneyAmount) throws NotValidIdException {
		UserEntity unluckyUser = this.userBackendService.getById(userId);
		Double currentBalance = unluckyUser.getBalance();
		Double newBalance = currentBalance - moneyAmount;
		unluckyUser.setBalance(newBalance);
		this.userBackendService.update(unluckyUser);
	}

	@Override
	public List<UserEntity> getUsersSortWealth() {
		return this.userDao.getAll("balance");
	}
}

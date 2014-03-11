package com.deniz.balanced.feasibility;

import java.util.List;

import org.apache.commons.lang.ArrayUtils;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.deniz.balanced.business.AccountingBusinessService;
import com.deniz.balanced.business.AuthenticationBusinessService;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.business.UserBusinessService;
import com.deniz.balanced.user.business.domain.UserDto;
import com.deniz.balanced.user.business.exception.AncestorInviteLimitReachedException;
import com.deniz.balanced.user.business.exception.AncestorNotExistsException;
import com.deniz.balanced.user.business.exception.DataAlreadyExistException;
import com.deniz.balanced.user.business.exception.EmailNotValidException;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.business.exception.PasswordNotMatchedException;
import com.deniz.balanced.user.business.exception.PasswordNotSecureException;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;

public class FeasibilityRunner {

	public static void main(String[] args) throws DataNotExistException, EmailNotValidException,
			PasswordNotSecureException, PasswordNotMatchedException, AncestorNotExistsException,
			DataAlreadyExistException, NotValidIdException {
		ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(
				"spring/com/deniz/balanced/0.spring.xml");

		UserBusinessService userBusinessService = (UserBusinessService) context.getBean("userBusinessService");
		AccountingBusinessService accountingBusinessService = (AccountingBusinessService) context
				.getBean("accountingBusinessService");
		AuthenticationBusinessService authenticationBusinessService = (AuthenticationBusinessService) context
				.getBean("authenticationBusinessService");
		UserBackendService userBackendService = (UserBackendService) context.getBean("userBackendService");

		int[] samplingArray = { 100 };

		System.out.println("----------------------------------");
		System.out.println("------------START----------------");
		System.out.println("----------------------------------");

		for (int userToBeAddedForSetup = 1; userToBeAddedForSetup <= 200000; userToBeAddedForSetup++) {

			int denemeSayisi = 1;
			if (ArrayUtils.contains(samplingArray, userToBeAddedForSetup)) {
				System.out.println(userToBeAddedForSetup + " kullanicili testte " + denemeSayisi
						+ " denemede alinan sonuc");

				int totalEarning = 0;
				int totalLosing = 0;
				double totalRootMoney = 0.0;
				for (int deneme = 1; deneme <= denemeSayisi; deneme++) {

					// Delete all for a fresh start
					userBackendService.deleteAll();

					// Add root again
					UserEntity firstUser = new UserEntity();
					firstUser.setSimpleName("ozgen");
					firstUser.setPassword("123456");
					firstUser.setEmail("ozgenerdem@hotmail.com");
					firstUser.setReference("AUJ34DEW");
					userBackendService.newUser(firstUser);

					List<String> referenceList = userBusinessService.getValidReferences();

					for (int i = 0; i < (userToBeAddedForSetup - 1); i++) {
						signUser(authenticationBusinessService, userBackendService, userToBeAddedForSetup,
								referenceList, i);

						UserDto user = userBusinessService.getByName("USER" + i);

						referenceList.add(user.getReferenceMeta().getValue());

					}
					List<UserDto> allUsers = accountingBusinessService.getUsersSortWealth();
					int earningUserCount = 0;
					int losingUserCount = 0;

					for (int userIndex = 0; userIndex < allUsers.size(); userIndex++) {
						UserDto userDto = allUsers.get(userIndex);
						Double balance = Double.parseDouble(userDto.getBalanceMeta().getValue());
						if (balance >= 0) {
							earningUserCount++;
						} else {
							losingUserCount++;
						}
					}
					totalEarning += earningUserCount;
					totalLosing += losingUserCount;

					UserDto ozgenUser = userBusinessService.getByName("ozgen");
					Double balance = Double.parseDouble(ozgenUser.getBalanceMeta().getValue());

					totalRootMoney += balance;
				}

				System.out.println("Kazanan kullanici sayisi   ----   " + totalEarning);
				System.out.println("Kaybeden kullanici sayisi   ----   " + totalLosing);
				System.out.println("Ortalama root parasi   ----   " + (totalRootMoney / denemeSayisi));

			}
		}
		System.out.println("----------------------------------");
		System.out.println("------------FINISH----------------");
		System.out.println("----------------------------------");
	}

	private static void signUser(AuthenticationBusinessService authenticationBusinessService,
			UserBackendService userBackendService, int userToBeAddedForSetup, List<String> referenceList, int i)
			throws EmailNotValidException, PasswordNotSecureException, PasswordNotMatchedException,
			AncestorNotExistsException, DataAlreadyExistException, DataNotExistException, NotValidIdException {
		int referenceIndex = (int) ((Math.random() * userToBeAddedForSetup) % (i + 1));
		String ancestorRef = referenceList.get(referenceIndex);

		try {
			authenticationBusinessService
					.signup("USER" + i, "123123", "123123", "user" + i + "@email.com", ancestorRef);
		} catch (AncestorInviteLimitReachedException e) {
			UserEntity limitedAncestor = userBackendService.getByReference(ancestorRef);
			if (limitedAncestor.getCurrentLevel() < userBackendService.getChildren(limitedAncestor.getId()).size()) {
				if (limitedAncestor.getCurrentLevel() < 1) {
					System.err.println("LIMITED: " + i + " ninci kullanici " + limitedAncestor.getSimpleName()
							+ " level " + limitedAncestor.getCurrentLevel() + " childcount "
							+ userBackendService.getChildren(limitedAncestor.getId()).size());
				}
			}
			if (limitedAncestor.getCurrentLevel() > 5) {
				System.out.println("LEVELLIMITED: " + i + " ninci kullanici " + limitedAncestor.getSimpleName()
						+ " level " + limitedAncestor.getCurrentLevel() + " childcount "
						+ userBackendService.getChildren(limitedAncestor.getId()).size());
			}
			signUser(authenticationBusinessService, userBackendService, userToBeAddedForSetup, referenceList, i);
		}
	}

}

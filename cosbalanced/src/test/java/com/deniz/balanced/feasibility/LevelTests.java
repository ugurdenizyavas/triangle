package com.deniz.balanced.feasibility;

import com.deniz.balanced.business.AccountingBusinessService;
import com.deniz.balanced.business.AuthenticationBusinessService;
import com.deniz.balanced.framework.test.AbstractTransactionalTest;
import com.deniz.balanced.user.business.UserBusinessService;
import com.deniz.balanced.user.business.domain.UserDto;
import com.deniz.balanced.user.business.exception.AncestorInviteLimitReachedException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

public class LevelTests extends AbstractTransactionalTest {

	@Autowired
	private UserBusinessService userBusinessService;

	@Autowired
	private AccountingBusinessService accountingBusinessService;

	@Autowired
	private AuthenticationBusinessService authenticationBusinessService;

	private final int userToBeAddedForSetup = 200;

	@Before
	public void setUp() {
		// Setup Data Insertion has started first; so root data must exist
		int userCount = this.userBusinessService.getCount();
		Assert.assertEquals(userCount, 1);

		UserDto rootUser = null;
		try {
			rootUser = this.userBusinessService.getByName("ozgen");
		} catch (DataNotExistException e) {
			Assert.fail();
		}
		List<String> referenceList = new ArrayList<String>();
		// first user's reference
		referenceList.add(rootUser.getReferenceMeta().getValue());

		for (int i = 0; i < (this.userToBeAddedForSetup - 1); i++) {
			UserDto user = addUser(referenceList, i);

			referenceList.add(user.getReferenceMeta().getValue());
		}
		System.out.println(" -----   END  ------- ");
		// System.out.println(" Below are the users who are above level 5");
		List<UserDto> allUsers = this.accountingBusinessService
				.getUsersSortWealth();
		int earningUserCount = 0;
		int losingUserCount = 0;

		for (int userIndex = 0; userIndex < allUsers.size(); userIndex++) {
			UserDto userDto = allUsers.get(userIndex);
			// int childCount = 0;
			// try {
			// childCount =
			// this.userBusinessService.getChildren(userDto.getSimpleNameMeta().getValue()).size();
			// } catch (DataNotExistException e) {
			// Assert.fail();
			// } catch (NotValidIdException e) {
			// Assert.fail();
			// }
			// // if (Integer.parseInt(userDto.getCurrentLevelMeta().getValue())
			// >
			// // 5) {
			Double balance = Double.parseDouble(userDto.getBalanceMeta()
					.getValue());
			// System.out.println(userDto.getSimpleNameMeta().getValue() +
			// " -    ; " + userDto.getCurrentLevelMeta().getValue() + " - ;  "
			// + userDto.getExperienceMeta().getValue() + " - childs: " +
			// childCount
			// + " -money : " + balance);
			// // }
			//
			if (balance >= 0) {
				earningUserCount++;
			} else {
				losingUserCount++;
			}
		}
		System.out.println("Number of people earning : " + earningUserCount);
		System.out.println("Number of people losing: " + losingUserCount);
	}

	private UserDto addUser(List<String> referenceList, int i) {
		if (i < userToBeAddedForSetup) {
			int referenceIndex = (int) ((Math.random() * this.userToBeAddedForSetup) % (i + 1));
			String ancestorRef = referenceList.get(referenceIndex);

			UserDto user = null;
			try {
				this.authenticationBusinessService.signup("USER" + i, "1234qwer",
						"1234qwer", "user" + i + "@email.com", ancestorRef);

				user = this.userBusinessService.getByName("USER" + i);
			} catch (AncestorInviteLimitReachedException e) {
				return addUser(referenceList, i);
			} catch (Exception e) {
				e.printStackTrace();
				Assert.fail();
			}
			return user;
		}
		return null;
	}

	@Test
	public void deneme2() {
	}

	@Test
	public void deneme3() {
	}

	@Test
	public void deneme4() {
	}

	@Test
	public void deneme5() {
	}

	@Test
	public void deneme6() {
	}

	@Test
	public void deneme7() {
	}

	@Test
	public void deneme8() {
	}

	@Test
	public void deneme9() {
	}

	@Test
	public void deneme10() {
	}

}

package com.deniz.balanced.framework.test;

import java.util.Arrays;

import org.junit.After;
import org.junit.Before;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.transaction.TransactionConfiguration;

import com.deniz.balanced.framework.test.util.DbTableDeletionUtil;

@ContextConfiguration(locations = { "/spring/0.spring.xml" })
@TransactionConfiguration(defaultRollback = true)
public abstract class AbstractTransactionalTest extends AbstractTransactionalJUnit4SpringContextTests {
	private static final String LOGGING_PREFIX = "Empty DB: ";
	private static String[] dbTables;

	@Before
	public void before() {
		emptyDb();
	}

	/**
	 * Deletes all rows from all DB tables so that each unit-test works with an
	 * empty database.
	 */
	private void emptyDb() {
		if (dbTables == null) {
			this.logger.debug(LOGGING_PREFIX + "dbTables=null so tables names are being calculated...");
			dbTables = DbTableDeletionUtil.getTableNamesForDeletion(this.applicationContext);
		} else {
			this.logger.debug(LOGGING_PREFIX + "dbTables!=null so cached tables names will be used....");
		}
		try {
			deleteFromTables(dbTables);
		} catch (Exception e) {
			throw new RuntimeException("AbstractTransactionalTest.emptyDb could not delete the db before the unit-test run. Table order of deletion was: "
					+ Arrays.toString(dbTables), e);
		}
		this.logger.debug(LOGGING_PREFIX + " The following tables were deleted " + Arrays.toString(dbTables));
	}

	@After
	public void after() {
	}

}
package com.deniz.balanced.framework.test.util;

import org.hibernate.cfg.Configuration;
import org.hibernate.dialect.Dialect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.orm.hibernate3.LocalSessionFactoryBean;

import java.util.*;

/**
 * Utility that calculates a list of all tables in the database - in the correct
 * order for deletion so that no child record problems occur when the table rows
 * are deleted.
 * <p/>
 * <p>
 * The implementation uses the hibernate hbm2ddl tool, takes the create
 * </p>
 * <p/>
 * 
 * @author deniz.yavas
 */
public class DbTableDeletionUtil {
	protected static final Logger logger = LoggerFactory.getLogger(DbTableDeletionUtil.class);

	private static final String LOGGING_PREFIX = "Empty DB: ";
	private static final String CREATE_TABLE_PREFIX = "create table ";
	private static final String ALTER_TABLE_PREFIX = "alter table ";

	public static String[] getTableNamesForDeletion(ApplicationContext applicationContext) {
		List<String> createSQL = getCreateSQL(applicationContext);
		createSQL = calculateTableNamesForDeletion(createSQL);

		String[] createSQLArray = createSQL.toArray(new String[createSQL.size()]);
		return createSQLArray;
	}

	static List<String> calculateTableNamesForDeletion(List<String> createSQL) {
		logDebug(LOGGING_PREFIX + " Original createSQL...", createSQL);

		Map<String, Table> originalTables = new HashMap<String, Table>();
		Map<String, Table> finalTables = new HashMap<String, Table>();

		final List<String> tableNames = getTableNames(createSQL);
		// Prepare original and final map
		for (String tableName : tableNames) {
			Table table = new Table(tableName);
			originalTables.put(tableName, table);
			finalTables.put(tableName, table);
		}

		// Iterate over original map and restructure final map according to the
		// "alter table" statements
		final List<AlterStatementForeignKey> alterStatements = getAlterStatement(createSQL);
		logDebug(LOGGING_PREFIX + " Final table list in deletion order...", tableNames);

		for (AlterStatementForeignKey alterStatement : alterStatements) {
			finalTables.remove(alterStatement.fromTablename);
			Table toTable = originalTables.get(alterStatement.toTablename);
			final Table fromTable = originalTables.get(alterStatement.fromTablename);
			toTable.children.add(fromTable);
		}

		List<String> finalDeletionList = new ArrayList<String>();
		for (Map.Entry<String, Table> entry : finalTables.entrySet()) {
			final Table table = entry.getValue();
			visitTable(table, finalDeletionList);
		}
		Collections.reverse(finalDeletionList);
		return finalDeletionList;
	}

	private static void visitTable(Table table, List<String> finalDeletionList) {
		finalDeletionList.add(table.name);
		for (Table childTable : table.children) {
			if (!finalDeletionList.contains(childTable.name)) {
				visitTable(childTable, finalDeletionList);
			}
		}
	}

	private static List<String> getTableNames(List<String> createSQL) {
		ArrayList<String> tableNames = (ArrayList) ((ArrayList) createSQL).clone();
		removeLinesOtherThanCreate(tableNames);
		extractTableName(tableNames);
		return tableNames;
	}

	private static List<AlterStatementForeignKey> getAlterStatement(List<String> createSQL) {
		List<AlterStatementForeignKey> alterStatementsFinal = new ArrayList<AlterStatementForeignKey>();
		ArrayList<String> alterStatements = (ArrayList) ((ArrayList) createSQL).clone();
		removeLinesOtherThanAlterForeignKey(alterStatements);
		int i = 0;

		for (String line : alterStatements) {
			String[] words = line.split(" ");
			String from = words[2];
			String to = words[10];
			if (to.endsWith(";")) {
				to = to.substring(0, to.length() - 1);
			}
			AlterStatementForeignKey alterStatement = new AlterStatementForeignKey(from, to);
			alterStatementsFinal.add(alterStatement);
			i++;
		}
		return alterStatementsFinal;
	}

	private static List<String> getCreateSQL(ApplicationContext applicationContext) {
		LocalSessionFactoryBean sessionFactory = (LocalSessionFactoryBean) applicationContext.getBean("&sessionFactory");

		Configuration configuration = sessionFactory.getConfiguration();
		final Properties properties = configuration.getProperties();
		Dialect dialect = Dialect.getDialect(properties);
		String[] createSQLArray = configuration.generateSchemaCreationScript(dialect);
		return new ArrayList<String>(Arrays.asList(createSQLArray));
	}

	/**
	 * Removes lines that do not start with "create table "
	 */
	private static void removeLinesOtherThanCreate(List<String> statement) {
		Iterator<String> iterator = statement.iterator();
		while (iterator.hasNext()) {
			String line = iterator.next();
			if (!line.startsWith(CREATE_TABLE_PREFIX)) {
				iterator.remove();
			}
		}
	}

	/**
	 * Removes lines that do not start with "alter table "
	 */
	private static void removeLinesOtherThanAlterForeignKey(List<String> statement) {
		Iterator<String> iterator = statement.iterator();
		while (iterator.hasNext()) {
			String line = iterator.next();
			if (!line.startsWith(ALTER_TABLE_PREFIX) || !line.contains("foreign")) {
				iterator.remove();
			}
		}
	}

	/**
	 * Extracts the tablename (aka the 3rd word), removes everything else.
	 */
	private static void extractTableName(List<String> statement) {
		int i = 0;

		for (String line : statement) {
			String[] words = line.split(" ");
			statement.set(i, words[2]);
			i++;
		}
	}

	private static void logDebug(String headline, List<String> statement) {
		logger.debug("*** " + headline);
		for (String line : statement) {
			logger.debug(line);
		}
	}
}

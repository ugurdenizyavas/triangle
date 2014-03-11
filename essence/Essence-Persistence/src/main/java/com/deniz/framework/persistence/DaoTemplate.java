package com.deniz.framework.persistence;

import java.util.Collection;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.stereotype.Repository;

import com.deniz.framework.logging.LoggingHelper;
import com.deniz.framework.persistence.entity.AbstractEntity;


/**
 * Base class that is used for all dao classes.
 * <p/>
 * <p/>
 * 
 * @author Deniz Yavas
 */
@Repository
public abstract class DaoTemplate<E extends AbstractEntity>
{
	protected final Logger logger = LoggerFactory.getLogger( getClass() );

	private static final String NO_PARAMETERS_GIVEN = "None";
	private SessionFactory sessionFactory;

	@Required
	public void setSessionFactory( SessionFactory sessionFactory )
	{
		this.sessionFactory = sessionFactory;
	}

	protected Session getCurrentSession()
	{
		return sessionFactory.getCurrentSession();
	}

	public void flush()
	{
		getCurrentSession().flush();
	}

	public void save( E abstractEntity )
	{
		logger.debug( abstractEntity.getClass().getSimpleName() + " : " + abstractEntity.getInfo() + " is saved." );
		getCurrentSession().save( abstractEntity );
	}


	public void update( E abstractEntity )
	{
		getCurrentSession().update( abstractEntity );
	}

	/**
	 * Logs a save, updated or delete operation on INFO and DEBUG level.
	 * 
	 * @param operation
	 *            the operation is e.g. "SaveOrUpdate" or "Delete" that was
	 *            called.
	 * @param abstractEntity
	 *            the entity that was persisted.
	 */
	protected void logPersistence( PersistenceOperation operation, AbstractEntity abstractEntity )
	{
		logPersistenceInfo( operation, abstractEntity );
		logPersistenceDebug( operation, abstractEntity );
	}

	/**
	 * Logs a save, updated or delete operation on INFO level. </p>
	 * 
	 * @param operation
	 *            the operation is e.g. "SaveOrUpdate" or "Delete" that was
	 *            called.
	 * @param abstractEntity
	 *            the entity that was persisted.
	 */
	private void logPersistenceInfo( PersistenceOperation operation, AbstractEntity abstractEntity )
	{
		String logString = "OPERATION: " + operation + " BUSINESS-OBJECT ("
							+ LoggingHelper.getTypeAndPk( abstractEntity.getClass().getSimpleName(), abstractEntity.getId() ) + "): "
							+ abstractEntity.getInfo();
		logger.info( logString );
	}

	/**
	 * Logs all data contained in an entity on DEBUG level. </p>
	 * 
	 * @param operation
	 *            The operation is e.g. "SaveOrUpdate" or "Delete" that was
	 *            called.
	 * @param abstractEntity
	 *            the entity, the implementation will call .toString() on this
	 *            entity.
	 */
	private void logPersistenceDebug( PersistenceOperation operation, AbstractEntity abstractEntity )
	{
		if ( logger.isDebugEnabled() )
		{
			String logString = "OPERATION: " + operation + " BUSINESS-OBJECT ("
								+ LoggingHelper.getTypeAndPk( abstractEntity.getClass().getSimpleName(), abstractEntity.getId() ) + ") : "
								+ abstractEntity;
			logger.debug( logString );
		}
	}

	/**
	 * Logs query parameters and a result info on INFO level. </p>
	 * 
	 * @param operation
	 *            The operation is e.g. "GetById"
	 * @param parameters
	 *            Parameter should always be given in the following format:
	 *            "name:flight, prefix:de, showOnlyGermany=true". "null" is
	 *            allowed, the implementation will will that add an appropriate
	 *            messages stating that no parameters were given.
	 * @param result
	 *            a single entity or an array of entities
	 * @see DaoTemplate#NO_PARAMETERS_GIVEN
	 */
	protected void logQuery( String operation, String parameters, Object... result )
	{
		if ( parameters == null )
			parameters = NO_PARAMETERS_GIVEN;

		String resultString;
		if ( result == null || result[ 0 ] == null )
			resultString = "0 entities found";
		else
		{
			resultString = result.length + " entities found";
		}

		String logString = "OPERATION: " + operation + " PARAMETERS: " + parameters + " RESULT: " + resultString;
		logger.info( logString );
	}

	/**
	 * Logs query parameters and a result info on INFO level. </p>
	 * 
	 * @param operation
	 *            The operation is e.g. "GetById"
	 * @param parameters
	 *            Parameter should always be given in the following format:
	 *            "name:flight, prefix:de, showOnlyGermany=true". "null" is
	 *            allowed, the implementation will will that add an appropriate
	 *            messages stating that no parameters were given.
	 * @param result
	 *            a single entity or an array of entities
	 * @see DaoTemplate#NO_PARAMETERS_GIVEN
	 */
	protected void logQuery( String operation, String parameters, Collection<?> result )
	{
		if ( parameters == null )
			parameters = NO_PARAMETERS_GIVEN;

		String resultString;
		if ( result == null )
			resultString = "0 entities found";
		else
		{
			resultString = result.size() + " entities found";
		}

		String logString = "OPERATION: " + operation + " PARAMETERS: " + parameters + " RESULT: " + resultString;
		logger.info( logString );
	}

}
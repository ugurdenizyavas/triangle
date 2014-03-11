package com.deniz.framework.persistence;

/**
 * <p/>
 * This enum represents the different persistence operations.
 * It is used to have consistent logmessage because the logmessage contain the persistence operation that was called.
 * </p>
 * @author Deniz Yavas
 */
public enum PersistenceOperation
{
	SAVE_OR_UPDATE( "SaveOrUpdate" ),
	DELETE("Delete");

	private final String name;

	PersistenceOperation( String name )
	{
		this.name = name;
	}


	@Override
	public String toString()
	{
		return name;
	}
}

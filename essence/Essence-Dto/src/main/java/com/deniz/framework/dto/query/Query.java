package com.deniz.framework.dto.query;

/**
 * @author deniz.yavas
 */
public abstract class Query
{
	String queryId;

	public String getQueryId()
	{
		return queryId;
	}

	public void setQueryId( String queryId )
	{
		this.queryId = queryId;
	}

	abstract public boolean equals( Object o );

	abstract public int hashCode();

}

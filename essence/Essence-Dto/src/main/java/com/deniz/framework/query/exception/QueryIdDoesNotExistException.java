package com.deniz.framework.query.exception;

/**
 * @author deniz.yavas
 *
 */
public class QueryIdDoesNotExistException extends RuntimeException
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
}

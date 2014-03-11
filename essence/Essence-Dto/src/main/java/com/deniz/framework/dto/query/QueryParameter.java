package com.deniz.framework.dto.query;

/**
 * Immutable class that represents a filled query parameter that a user has entered.
 * E.g. When the user entered "Peter" in a search field named "givenName" then "givenName" is the parameterName
 * and "Peter" is the parameterValue.
 *
 * @author deniz.yavas
 */
public class QueryParameter
{
	private final String parameterName;
	private final Object parameterValue;

	public QueryParameter( String parameterName, Object parameterValue )
	{
		this.parameterName = parameterName;
		this.parameterValue = parameterValue;
	}

	public String getParameterName()
	{
		return parameterName;
	}

	public Object getParameterValue()
	{
		return parameterValue;
	}

	@Override
	public boolean equals( Object o )
	{
		if ( this == o ) return true;
		if ( o == null || getClass() != o.getClass() ) return false;

		QueryParameter that = (QueryParameter) o;

		if ( parameterName != null ? !parameterName.equals( that.parameterName ) : that.parameterName != null )
			return false;
		if ( parameterValue != null ? !parameterValue.equals( that.parameterValue ) : that.parameterValue != null )
		{
			return false;
		}

		return true;
	}

	@Override
	public int hashCode()
	{
		int result = parameterName != null ? parameterName.hashCode() : 0;
		result = 31 * result + (parameterValue != null ? parameterValue.hashCode() : 0);
		return result;
	}
}

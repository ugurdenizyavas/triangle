package com.deniz.framework.dto.sorting;

import java.io.Serializable;


/**
 * @author deniz.yavas
 */
public class SortOrder implements Serializable
{
	public enum Direction
	{
		/** Means ascending. */
		UP,
		/** Means descending. */
		DOWN;

		public static Direction fromString( String direction )
		{
			if ( direction.equalsIgnoreCase( "up" ) || direction.equalsIgnoreCase( "asc" ) )
			{
				return Direction.UP;
			}
			else if ( direction.equalsIgnoreCase( "down" ) || direction.equalsIgnoreCase( "desc" ) )
			{
				return Direction.DOWN;
			}
			else
			{
				throw new RuntimeException( "Unsupported direction string '" + direction + "'. Only 'up' or 'down' are allowed." );
			}
		}

		public String getUpDown()
		{
			if ( this == UP )
				return "up";
			else
			{
				return "down";
			}
		}

		public String getAscDesc()
		{
			if ( this == UP )
				return "asc";
			else
			{
				return "desc";
			}
		}
	}

	private String fieldName;
	private Direction direction;


	/**
	 * @param fieldName Name of the field that should be sorted, e.g. 'reportNumber'
	 * @param direction 'Direction.UP'(aka 'asc') or 'Direction.DOWN'(aka 'desc')
	 */
	public SortOrder( String fieldName, Direction direction )
	{
		this.fieldName = fieldName;
		this.direction = direction;
	}

	/**
	 * @param fieldName Name of the field that should be sorted, e.g. 'reportNumber'
	 * @param direction 'up'(aka 'asc') or 'down'(aka 'desc')
	 */
	public SortOrder( String fieldName, String direction )
	{
		this.fieldName = fieldName;
		this.direction = Direction.fromString( direction );
	}

	public String getFieldName()
	{
		return fieldName;
	}

	public Direction getDirection()
	{
		return direction;
	}

	/**
	 * Returns the direction as a string.
	 * @return either "up" or "down"
	 */
	public String getUpDown()
	{
		return direction.getUpDown();
	}

	/**
	 * Returns the ANSI direction as a string.
	 * @return either "asc" or "desc"
	 */
	public String getAscDesc()
	{
		return direction.getAscDesc();
	}

	@Override
	public String toString()
	{
		return "SortOrder{" + "fieldName='" + fieldName + '\'' + ", direction=" + direction + '}';
	}

	@Override
	/**
	 * For equals we only look at the fieldName. If you have two sort orders with the same fieldName then they are
	 * identical. The direction is only seconndary data.
	 *
	 * If you specify orders in a sql order by clause it would not make sense add an order by for the same field
	 * twice: One order by with asc, one with desc.
	 */
	public boolean equals( Object o )
	{
		if ( this == o )
			return true;
		if ( o == null || getClass() != o.getClass() )
			return false;

		SortOrder sortOrder = (SortOrder) o;

		if ( fieldName != null ? !fieldName.equals( sortOrder.fieldName ) : sortOrder.fieldName != null )
			return false;

		return true;
	}

	@Override
	public int hashCode()
	{
		return fieldName != null ? fieldName.hashCode() : 0;
	}
}

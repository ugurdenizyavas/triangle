package com.deniz.framework.dto.query;


import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.commons.lang.Validate;

import com.deniz.framework.dto.sorting.SortOrder;


/**
 * Simple transfer object that should be used as return type for all queries.
 * <p/>
 * <p>
 * The entities that represent the result of a query are added to <code>QueryResult</code> along with the rowCount. The rowCount
 * is the number of rows a query returns. in case you use pagination it is the overall row count, not the number of rows you
 * return per page! If you don't use pagination the rowCount is equal to entities.size().
 * <p/>
 * @author deniz.yavas
 */
public class QueryResult<T> implements Serializable
{

	private List<T> entities;
	private Integer rowCount;
	private List<SortOrder> sortOrders;

	public QueryResult( List<T> entities, Integer rowCount, List<SortOrder> userChosenSortOrders, List<SortOrder> additionalSortOrders )
	{
		this.entities = entities;
		this.rowCount = rowCount;

		if ( userChosenSortOrders == null )
			userChosenSortOrders = Collections.emptyList();
		if ( additionalSortOrders == null )
			additionalSortOrders = Collections.emptyList();
		mergeSortOrders( userChosenSortOrders, additionalSortOrders );

	}

	public List<T> getEntities()
	{
		return entities;
	}


	public Integer getRowCount()
	{
		return rowCount;
	}

	public List<SortOrder> getSortOrders()
	{
		return sortOrders;
	}

	private void mergeSortOrders( List<SortOrder> userChosenSortOrders, List<SortOrder> additionalSortOrders )
	{
		Validate.notNull( userChosenSortOrders, "Parameter userChosenSortOrders can't be null!" );
		Validate.notNull( additionalSortOrders, "Parameter additionalSortOrders can't be null!" );

		sortOrders = new ArrayList<SortOrder>();
		for ( SortOrder userChosenSortOrder : userChosenSortOrders )
		{
			sortOrders.add( userChosenSortOrder );
		}
		for ( SortOrder additionalSortOrder : additionalSortOrders )
		{
			if ( !sortOrders.contains( additionalSortOrder ) )
			{
				sortOrders.add( additionalSortOrder );
			}
		}
	}

}

package com.deniz.framework.query.service.impl;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.deniz.framework.dto.query.Query;
import com.deniz.framework.dto.sorting.SortOrder;

/**
 * @author deniz.yavas
 *
 */
public class QueryHolder
{

	Query query;
	String pageNumber, pageSize;
	List<SortOrder> sortOrders;

	Date lastTouched;

	public QueryHolder( Query query, String pageSize, String pageNumber, List<SortOrder> sortOrders )
	{
		this.query = query;
		this.pageSize = pageSize;
		this.pageNumber = pageNumber;
		setSortOrders( sortOrders );
		touch();
	}

	void touch()
	{
		lastTouched = new Date();
	}

	public Query getQuery()
	{
		return query;
	}

	public void setQuery( Query query )
	{
		this.query = query;
	}

	public String getPageSize()
	{
		return pageSize;
	}

	public void setPageSize( String pageSize )
	{
		this.pageSize = pageSize;
	}

	public String getPageNumber()
	{
		return pageNumber;
	}

	public void setPageNumber( String pageNumber )
	{
		this.pageNumber = pageNumber;
	}

	public List<SortOrder> getSortOrders()
	{
		return sortOrders;
	}

	public void setSortOrders( List<SortOrder> sortOrders )
	{
		if ( sortOrders == null )
		{
			this.sortOrders = new ArrayList<SortOrder>();
		}
		else
		{
			this.sortOrders = sortOrders;
		}
	}

	public Date getLastTouched()
	{
		return lastTouched;
	}
}

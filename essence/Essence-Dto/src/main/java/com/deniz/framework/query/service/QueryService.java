package com.deniz.framework.query.service;

import java.util.List;

import com.deniz.framework.dto.query.Query;
import com.deniz.framework.dto.sorting.SortOrder;


/**
 * Service for holding query parameters, current page and current sort orders.
 * <p/>
 * Implementations are free to use cleanup strategies like removing queries that
 * are older than x seconds or other algorithms.
 * <p/>
 * @author deniz.yavas
 *
 */
public interface QueryService
{

	String register( Query query, String pageSize, String pageNumber, List<SortOrder> sortOrders );


	Query getQuery( String queryId );

	String getPageNumber( String queryId );

	void updatePageNumber( String queryId, String pageNumber );

	String getPageSize( String queryId );

	void updatePageSize( String queryId, String pageSize );

	List<SortOrder> getSortOrders( String queryId );

	void updateSortOrders( String queryId, List<SortOrder> sortOrders );

}

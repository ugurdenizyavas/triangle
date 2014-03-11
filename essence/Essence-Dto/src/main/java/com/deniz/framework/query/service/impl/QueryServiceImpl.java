package com.deniz.framework.query.service.impl;


import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.deniz.framework.dto.query.Query;
import com.deniz.framework.dto.sorting.SortOrder;
import com.deniz.framework.query.exception.QueryIdDoesNotExistException;
import com.deniz.framework.query.service.QueryService;

/**
 * This implementation offers a configurable 'time to live' in seconds. All
 * queries older than this ttl are automatically removed.
 * <p/>
 * All operations that register, update or retrieve a query update a timestamp which represents the last touch of that query.
 * <p/>
 * <p/>
 * <p/>Thread safety Implementation Details: We use ConcurrentHashMap, so all put/get access to the Hashmap is safe.
 * The removeOldQueries which is not Thread safe by itself has an extra synchronized block.
 * <p/>
 * @author deniz.yavas
 *
 */
public class QueryServiceImpl implements QueryService
{
	protected final Logger logger = LoggerFactory.getLogger( getClass() );
	private Integer ttlInSeconds;

	private Map<String, QueryHolder> queryHolderMap;
	private static final int DEFAULT_TTL_IN_SECONDS = 30 * 60;

	public QueryServiceImpl()
	{
		queryHolderMap = new ConcurrentHashMap<String, QueryHolder>();
	}

	public String register( Query query, String pageSize, String pageNumber, List<SortOrder> sortOrders )
	{
		if ( sortOrders == null )
		{
			sortOrders = new ArrayList<SortOrder>();
		}
		String queryId = generateQueryId();
		query.setQueryId( queryId );
		QueryHolder queryHolder = new QueryHolder( query, pageSize, pageNumber, sortOrders );
		queryHolderMap.put( queryId, queryHolder );

		logger.info( "New query registered, queryId = {}", queryId );

		return queryId;
	}

	private String generateQueryId()
	{
		UUID uuid = UUID.randomUUID();
		return uuid.toString();
	}

	public void removeOldQueries()
	{
		synchronized (queryHolderMap)
		{
			logger.debug( "Running removeOldQueries with ttl = {}s", getTtlInSeconds() );
			List<String> queryIdsForRemoval = new ArrayList<String>();
			for ( Map.Entry<String, QueryHolder> entry : queryHolderMap.entrySet() )
			{
				String queryId = entry.getKey();
				long differenceInSeconds = timeDifferenceInSecondsUntilNow( entry.getValue().getLastTouched() );
				if ( differenceInSeconds >= getTtlInSeconds() )
				{
					queryIdsForRemoval.add( queryId );
					String[] parameters = new String[]{queryId, differenceInSeconds + "", getTtlInSeconds() + ""};
					logger.info( "Query with queryId = {} removed. Query was {}s old, ttl was {}s.", parameters );
				}
			}
			for ( String queryId : queryIdsForRemoval )
			{
				queryHolderMap.remove( queryId );
			}
		}
	}

	private long timeDifferenceInSecondsUntilNow( Date lastTouched )
	{
		Date now = new Date();
		long differenceInSeconds = (now.getTime() - lastTouched.getTime()) / 1000;
		return differenceInSeconds;
	}

	public Query getQuery( String queryId )
	{
		Validate.notNull(queryId, "Parameter queryId can't be null!");
		assertQueryIdExists( queryId );
		QueryHolder queryHolder = queryHolderMap.get( queryId );
		queryHolder.touch();
		return queryHolder.getQuery();
	}

	public String getPageSize( String queryId )
	{
		assertQueryIdExists( queryId );
		QueryHolder queryHolder = queryHolderMap.get( queryId );
		queryHolder.touch();
		return queryHolder.getPageSize();
	}

	public void updatePageSize( String queryId, String pageSize )
	{
		assertQueryIdExists( queryId );
		QueryHolder queryHolder = queryHolderMap.get( queryId );
		queryHolder.touch();
		queryHolder.setPageSize( pageSize );
	}


	public String getPageNumber( String queryId )
	{
		assertQueryIdExists( queryId );
		QueryHolder queryHolder = queryHolderMap.get( queryId );
		queryHolder.touch();
		return queryHolder.getPageNumber();
	}

	public void updatePageNumber( String queryId, String pageNumber )
	{
		assertQueryIdExists( queryId );
		QueryHolder queryHolder = queryHolderMap.get( queryId );
		queryHolder.touch();
		queryHolder.setPageNumber( pageNumber );
	}

	public List<SortOrder> getSortOrders( String queryId )
	{
		assertQueryIdExists( queryId );
		QueryHolder queryHolder = queryHolderMap.get( queryId );
		queryHolder.touch();
		return queryHolder.getSortOrders();
	}

	public void updateSortOrders( String queryId, List<SortOrder> sortOrders )
	{
		assertQueryIdExists( queryId );
		QueryHolder queryHolder = queryHolderMap.get( queryId );
		queryHolder.touch();
		queryHolder.setSortOrders( sortOrders );
	}

	private void assertQueryIdExists( String queryId )
	{
		if ( !exists( queryId ) )
		{
			QueryIdDoesNotExistException e = new QueryIdDoesNotExistException();
			e.setQueryId( queryId );
			throw e;
		}
	}

	boolean exists( String queryId )
	{
		return queryHolderMap.containsKey( queryId );
	}

	public void setTtlInSeconds( int ttlInSeconds )
	{
		this.ttlInSeconds = ttlInSeconds;
	}

	public int getTtlInSeconds()
	{
		if ( ttlInSeconds != null )
		{
			return ttlInSeconds;
		}
		else
		{
			return DEFAULT_TTL_IN_SECONDS;
		}
	}
}

package com.deniz.framework.dto.paging;

import java.io.Serializable;


/**
 * A simple data transfer object that contains paging date.
 * <p/>
 * <p>
 * It is used in particular to transfer this information from the service layer to the persistence layer.
 * <p/>
 * @author deniz.yavas
 */
public class PageInfo implements Serializable
{
	private enum Mode
	{
		SHOW_ONE_PAGE,
		SHOW_ALL_PAGES
	}

	private static final Integer SHOW_ALL_PAGES_PAGE_NUMBER = new Integer( 1 );

	private Integer pageNumber;
	private Integer firstRowNumber;
	private Integer numberOfRows;

	private Mode mode;

	/**
	 * If paging is on then this contructor should be used.
	 * @param pageNumber mandatory, specifies the page number that should be shown e.g. 3.
	 * @param firstRowNumber mandatory, the the row number of the first row of the page that should be shown
	 * @param numberOfRows mandatory, the number of rows that should be shown.
	 */
	public PageInfo( Integer pageNumber, Integer firstRowNumber, Integer numberOfRows )
	{
		if ( pageNumber == null || firstRowNumber == null || numberOfRows == null )
		{
			throw new IllegalArgumentException( "pageNumber, firstRowNumber and numberOfRows are mandatory arguments." );
		}
		this.pageNumber = pageNumber;
		this.firstRowNumber = firstRowNumber;
		this.numberOfRows = numberOfRows;
		mode = Mode.SHOW_ONE_PAGE;
	}

	/**
	 * If paging is off (because the user specified that she wants to see all pages), this constructor should be used.
	 */
	public PageInfo()
	{
		mode = Mode.SHOW_ALL_PAGES;
	}

	/**
	 * There are two modes: "show one page" and "show all pages".
	 * @return boolean
	 */
	public boolean isModeShowOnePage()
	{
		return mode == Mode.SHOW_ONE_PAGE;
	}

	/**
	 * There are two modes: "show one page" and "show all pages".
	 * @return boolean
	 */
	public boolean isModeShowAllPages()
	{
		return mode == Mode.SHOW_ALL_PAGES;
	}

	/**
	 * Specifies the page number that should be shown e.g. 3.
	 * First page is 1.
	 * @return Integer
	 */
	public Integer getPageNumber()
	{
		if ( mode == Mode.SHOW_ALL_PAGES )
		{
			return SHOW_ALL_PAGES_PAGE_NUMBER;
		}
		return pageNumber;
	}

	/**
	 * The the row number of the first row of the page that should be shown.
	 * First row is 0.
	 * @return Integer
	 */
	public Integer getFirstRowNumber()
	{
		return firstRowNumber;
	}

	/**
	 * The number of rows that should be shown. This is the pageSize, not
	 * the total number of rows in the result!
	 * @return Integer
	 */
	public Integer getNumberOfRows()
	{
		return numberOfRows;
	}

}

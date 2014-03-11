package com.deniz.framework.security;

import javax.servlet.http.HttpServletRequest;

/**
 * A RequestInfoProvider taking the RequestInfo from the current thread
 * via a ThreadLocal.
 * For common use, you should <b>not use this class</b> but
 * StandardRequestInfoProvider
 * instead.
 * The later ensure future compatibility!
 * <p/>
 * Created: 08.04.2010 15:10:08<br/>
 * &copy; Informationsdesign AG
 *
 * @author Ralf Th. Pietsch
 * @version $Revision$
 * @see StandardRequestInfoProvider
 */
public class ThreadLocalRequestInfoProvider implements RequestInfoProvider
{
	// ==== static members ====

	public static RequestInfo getRequestInfo()
	{
		return THREAD_LOCAL.get();
	}

	// private static final Logger LOGGER = LoggerFactory.getLogger( ThreadLocalRequestInfoProvider.class );

	// ==== private attributes ====

	// ==== private members ====

	private static final RequestInfoThreadLocal THREAD_LOCAL = new RequestInfoThreadLocal();

	// ==== constructors ====

	// ==== simple getters and setters ====

	// ==== "complex" getters and setters ====

	// ==== lifecycle methods ====

	// ==== interface RequestInfoProvider implementation ====

	public RequestInfo getCurrentRequestInfo()
	{
		return THREAD_LOCAL.get();
	}

	// ==== business logic ====

	public void setRequestInfo( RequestInfo requestInfo )
	{
		THREAD_LOCAL.set( requestInfo );
		// LOGGER.debug( "Set request info in thread " + Thread.currentThread().getId() + " to " + requestInfo );
	}

	public void removeRequestInfo()
	{
		THREAD_LOCAL.remove();
	}

	// ==== private methods ====

	// ==== methods from java.lang.Object ====

	private static class RequestInfoThreadLocal extends ThreadLocal<RequestInfo>
	{
		private static final RequestInfo INITIAL_VALUE = new PojoRequestInfo();

		@Override
		protected RequestInfo initialValue()
		{
			return INITIAL_VALUE;
		}
	}

	@Override
	public RequestInfo getCurrentRequestInfo(HttpServletRequest request) {
		return getCurrentRequestInfo();
	}

}

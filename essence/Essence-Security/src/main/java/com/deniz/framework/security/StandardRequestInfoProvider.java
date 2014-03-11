package com.deniz.framework.security;

import javax.servlet.http.HttpServletRequest;

/**
 * The standard implementation of RequestInfoProvider.
 * This implementation ensure direct access to the RequestInfo-object
 * build in DispatcherGateFilter.
 * You may use instances of this class in SpringContext, if you like to access
 * the current RequestInfo.
 * <p/>
 * Created: 08.04.2010 15:48:50<br/>
 * &copy; Informationsdesign AG
 *
 * @author Ralf Th. Pietsch
 * @version $Revision$
 */
public class StandardRequestInfoProvider implements RequestInfoProvider
{
	// ==== static members ====

	/**
	 * A static convenient method; for those who like that.
	 * @return The RequestInfo of the current thread.
	 * @deprecated Inject a RequestInfoProvider in your bean instead! (2010-09-14, rtp.)
	 */
	@Deprecated
	public static RequestInfo getRequestInfo()
	{
		return ThreadLocalRequestInfoProvider.getRequestInfo();
	}

	// ==== private attributes ====

	// ==== private members ====

	// ==== constructors ====

	// ==== simple getters and setters ====

	// ==== "complex" getters and setters ====

	// ==== lifecycle methods ====

	// ==== interface RequestInfoProvider implementation ====

	/**
	 * Returns the same object, as the static method; but implements
	 * the RequestInfoProvider-interface.
	 * @return The RequestInfo of the current thread.
	 */
	public RequestInfo getCurrentRequestInfo()
	{
		return ThreadLocalRequestInfoProvider.getRequestInfo();
	}

	// ==== business logic ====

	// ==== private methods ====

	// ==== methods from java.lang.Object ====

	@Override
	public RequestInfo getCurrentRequestInfo(HttpServletRequest request) {
		return getCurrentRequestInfo();
	}
}

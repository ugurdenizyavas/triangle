package com.deniz.framework.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.springframework.web.servlet.DispatcherServlet;

public class SecurityDispatcherServlet extends DispatcherServlet {

	protected String loginController;

	private static final Logger log = LoggerFactory
			.getLogger(SecurityDispatcherServlet.class);

	protected void doService(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		// TestingRequestInfoProvider requestInfoProvider =
		// (TestingRequestInfoProvider)
		// getBeanFromContext("framework_RequestInfoProvider");

		// if (!Boolean.parseBoolean(requestInfoProvider.isTestMode())) {
		// RequestInfo currentUser = requestInfoProvider
		// .getCurrentRequestInfo();
		// if (currentUser == null
		// || StringUtils.isEmpty(currentUser.getUsername())) {
		// log.info("User anonymous does not exists or session is dropped, login again...");
		// HttpServletRequest req = (HttpServletRequest) request;
		// System.out.println("requested path = " + req.getRequestURI());
		//
		// loginController = getServletConfig()
		// .getInitParameter("loginController");
		//
		// TaskControllerTemplate loginControllerTemplate =
		// (TaskControllerTemplate) getBeanFromContext("loginController");
		//
		// HttpServletRequest request = new
		// loginControllerTemplate.handleRequest(request, response);
		//
		// ServletContext othercontext = getServletContext().getContext(
		// "/UserAdministration");
		// RequestDispatcher dispatcher = othercontext
		// .getRequestDispatcher("/services/login/init");
		// dispatcher.forward(request, response);
		// // TODO: Redirect to login page
		// } else {
		// // TODO: checkAuthenticationFromUserAdminApp(username,
		// // domain)
		// // if(fails)
		// log.debug("User "
		// + currentUser.getUsername()
		// + "@"
		// + currentUser.getDomain()
		// +
		// " does not have sufficient rights, so it is being redirected to login page.");
		// // TODO: Redirect to login page
		// // else{
		// // context.getRequestDispatcher(resource).forward(request,
		// // response);
		// // }
		// }
		// }
		super.doService(request, response);
	}

	private Object getBeanFromContext(String beanName) {
		return WebApplicationContextUtils.getRequiredWebApplicationContext(
				getServletContext()).getBean(beanName);
	}

}

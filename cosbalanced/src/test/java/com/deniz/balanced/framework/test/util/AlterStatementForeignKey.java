package com.deniz.balanced.framework.test.util;

/**
 * Creation Date: 26.01.12 11:45<br/>
 * Last Change: $Date: 2012-01-26 14:06:21 +0100 (Do, 26 Jan 2012) $ by $Author:
 * buck $<br/>
 * &copy; Informationsdesign AG
 * 
 * @author Stefan Buck
 * @version $Revision: 95312 $
 */
public class AlterStatementForeignKey {
	public String fromTablename;
	public String toTablename;

	public AlterStatementForeignKey(String fromTablename, String toTablename) {
		this.fromTablename = fromTablename;
		this.toTablename = toTablename;
	}
}

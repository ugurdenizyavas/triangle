package com.deniz.balanced.framework.test.util;

import java.util.ArrayList;
import java.util.List;

/**
 * Creation Date: 26.01.12 11:17<br/>
 * Last Change: $Date: 2012-01-26 14:06:21 +0100 (Do, 26 Jan 2012) $ by $Author:
 * buck $<br/>
 * &copy; Informationsdesign AG
 * 
 * @author Stefan Buck
 * @version $Revision: 95312 $
 */
public class Table {
	public String name;
	public List<Table> children = new ArrayList<Table>();

	public Table(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		return this.name;
	}
}

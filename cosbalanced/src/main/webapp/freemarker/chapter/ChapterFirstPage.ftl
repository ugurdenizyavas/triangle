<fo:block text-align="left" space-before="60mm" space-after="65mm" font-size="${fontsize_head_line}">
            <![CDATA[${reportTitle}]]>
</fo:block>

<fo:block>

	<fo:table table-layout="fixed" width="50%">
		<fo:table-body>
			<fo:table-row>
				<fo:table-cell text-align="left">
					<fo:block font-style="italic">Date:</fo:block>
	                         <fo:block><fo:leader/></fo:block>
				</fo:table-cell>
				<fo:table-cell text-align="left">
					<fo:block font-style="italic">${today}</fo:block>
	                         <fo:block><fo:leader/></fo:block>
				</fo:table-cell>
			</fo:table-row>
			<fo:table-row>
				<fo:table-cell text-align="left">
					<fo:block font-style="italic">Author(en):</fo:block>
	                         <fo:block><fo:leader/></fo:block>
				</fo:table-cell>
				<fo:table-cell text-align="left">
					<fo:block font-style="italic">${dto.authorNameMeta.value}</fo:block>
	                         <fo:block><fo:leader/></fo:block>
				</fo:table-cell>
			</fo:table-row>
			<fo:table-row>
				<fo:table-cell text-align="left">
					<fo:block font-style="italic">Department:</fo:block>
	                         <fo:block><fo:leader/></fo:block>
				</fo:table-cell>
				<fo:table-cell text-align="left">
					<fo:block font-style="italic"><![CDATA[ ${dto.authorGroupNameMeta.value}]]></fo:block>
	                         <fo:block><fo:leader/></fo:block>
				</fo:table-cell>
			</fo:table-row>
		</fo:table-body>
	</fo:table>
</fo:block>
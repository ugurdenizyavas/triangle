<fo:block-container font-size="3mm"
                    font-weight="bold">
    <fo:block>
        <fo:table table-layout="fixed" width="100%" border-top-style="solid" border-top-width="0.3mm" border-top-color="black">
            <fo:table-column column-width="80mm" column-number="1"/>
            <fo:table-column column-width="90mm" column-number="2"/>
            <fo:table-body>
                <fo:table-row display-align="center">
                <fo:table-cell text-align="left">
                    <fo:block>
                        <![CDATA[${today}]]>
                    </fo:block>
                </fo:table-cell>
                <fo:table-cell text-align="right">
                    <fo:block>
                        <![CDATA[Page:]]> <fo:page-number /> / <fo:page-number-citation ref-id="last-page"/>
                    </fo:block>
                </fo:table-cell>
            </fo:table-row>
            </fo:table-body>
        </fo:table>
    </fo:block>

</fo:block-container>
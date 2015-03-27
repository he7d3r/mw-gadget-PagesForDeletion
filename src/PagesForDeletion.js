// [[File:User:He7d3r/Tools/PagesForDeletion.js]] (workaround for [[phab:T35355]])
/*jslint white: true */
/*global mediaWiki, jQuery */
/**
 * Loader for the PagesForDeletion gadget
 * @author: Helder (https://github.com/he7d3r)
 * @license: CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0/>
 */
( function ( mw, $ ) {
'use strict';
if ( $.inArray( mw.config.get('wgAction'), ['view', 'purge'] ) !== -1 ) {
        $(function () {
                if ( $('#pe-header').length !== 0 ) {
                        mw.loader.load( 'ext.gadget.PagesForDeletionCore' );
                }
        });
}
}( mediaWiki, jQuery ) );

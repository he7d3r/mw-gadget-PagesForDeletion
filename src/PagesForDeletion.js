/*jslint white: true */
/*global mediaWiki, jQuery */
( function ( mw, $ ) {
'use strict';
if( $.inArray( mw.config.get('wgAction'), ['view', 'purge'] ) !== -1 ){
        $(function(){
                if( $('#pe-header').length !== 0 ){
                        mw.loader.load( 'ext.gadget.PagesForDeletionCore' );
                }
        });
}
}( mediaWiki, jQuery ) );

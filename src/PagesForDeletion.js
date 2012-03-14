// [[Special:GlobalUsage/User:Helder.wiki/Tools/PagesForDeletion.js]] ([[File:User:Helder.wiki/Tools/PagesForDeletion.js]])
if( $.inArray( mw.config.get('wgAction'), ['view', 'purge'] ) !== -1 ){
        $(function(){
                if( $('#pe-header').length !== 0 ){
                        mw.loader.load( '//pt.wikibooks.org/w/index.php?title=User:Helder.wiki/Tools/PagesForDeletion.js&action=raw&ctype=text/javascript&smaxage=21600&maxage=86400' );
                }
        });
}

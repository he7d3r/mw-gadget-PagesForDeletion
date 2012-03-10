// [[Special:GlobalUsage/User:Helder.wiki/Tools/PagesForDeletion.js]] ([[File:User:Helder.wiki/Tools/PagesForDeletion.js]])
if( mw.config.get('wgPageName') === 'Wikipédia:Páginas_para_eliminar/Lista' && $.inArray( mw.config.get('wgAction'), ['view', 'purge'] ) !== -1 ){
    mw.loader.load( '//pt.wikibooks.org/w/index.php?title=User:Helder.wiki/Tools/PagesForDeletion.js&action=raw&ctype=text/javascript&smaxage=21600&maxage=86400' );
}

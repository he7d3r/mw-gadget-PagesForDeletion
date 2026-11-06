/**
 * Get list of pages for deletion on a given date
 * @author: Helder (https://github.com/he7d3r)
 * @license: CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0/>
 */
/*jslint browser: true, white: true, plusplus: true */
/*global jQuery, mediaWiki */
( function ( $, mw ) {
'use strict';

var pfd;
if ( typeof pfd === 'undefined' ) {

pfd = {};

pfd.PREFIX_LENGTH = 32; // 'Wikipédia:Páginas para eliminar/'.length

pfd.getUTCDate = function () {
	var now = new Date();
	return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
};

pfd.shortTitle = function ( title ) {
	return title.substr( pfd.PREFIX_LENGTH );
};

pfd.linksHtml = function ( pageTitle ) {
	return '(<a href="' + mw.html.escape( mw.util.getUrl( pageTitle ) ) + '">ver</a>' +
		'/<a href="' + mw.html.escape( mw.util.getUrl( pageTitle, { action: 'edit' } ) ) + '">editar</a>)';
};

pfd.generateTOC = function ( data ) {
	var	page, shortTitle, rev, i, l,
		toc = [];
	for (i = 0, l = data.query.pageids.length; i < l; i++) {
		page = data.query.pages[ data.query.pageids[i] ];
		shortTitle = pfd.shortTitle( page.title );
		rev = page.revisions[0];
		toc.push(
			'<tr><td>' +
			'<small>' + pfd.linksHtml( page.title ) + ' </small>' +
			'<a href="#' +
			// Ver http://svn.wikimedia.org/viewvc/mediawiki/trunk/phase3/includes/Sanitizer.php?view=markup#l1056
			// http://svn.wikimedia.org/viewvc/mediawiki/trunk/phase3/resources/mediawiki/mediawiki.util.js?view=markup#l114
			mw.util.wikiUrlencode( shortTitle ).replace( /\//g, '.2F' ).replace(/%/g, '.') + '">' +
			shortTitle + '</a></td><td>' +
			'<a href="' + mw.util.getUrl( 'Usuário: ' + rev.user ) + '">' + rev.user + '</a></td><td>' +
			rev.timestamp + '</td></tr>'
		);
	}
	pfd.$toc.html(
		'<table class="wikitable sortable"><caption>Índice</caption><thead><tr>' +
		'<th class="headerSort" title="Ordenar por ordem ascendente">Página</th>' +
		'<th class="headerSort" title="Ordenar por ordem ascendente">Último editor</th>' +
		'<th class="headerSort" title="Ordenar por ordem ascendente">Data/Hora</th>' +
//		'<th class="headerSort" title="Ordenar por ordem ascendente">Tamanho</th>' +
		'</tr></thead><tbody>' +
		toc.join('\n') +
		'</tbody></table>'
	).find('table').tablesorter();
};

pfd.getDataForTOC = function ( list ) {
	pfd.api.get( {
		action: 'query',
		prop: 'revisions',
		rvprop: 'timestamp|user', // |size
		titles: list.join('|'),
		indexpageids: true
	} ).done( pfd.generateTOC );
};

pfd.show = function ( html, title ) {
	var $box = $( '<div class="pfd-proposal"></div>' )
			.attr( 'data-title', title )
			.html( html ),
		$h;

	pfd.$target.append( $box );
	$( '#toc' ).remove();

	$h = $box.find( 'h2, h3' ).first();
	if ( $h.length && !$h.find( '.pfd-edit-links' ).length ) {
		$h.append(
			$( '<span class="pfd-edit-links"></span>' )
				.css( { fontSize: '85%', fontWeight: 'normal', marginLeft: '0.5em' } )
				.html( pfd.linksHtml( title ) )
		);
	}

	/* Popups compatibility via hook */
	mw.hook( 'wikipage.content' ).fire( pfd.$target );
};

pfd.parse = function ( titles ) {
	var current;
	pfd.$info.html(
		'Consultando a proposta de eliminação da página "' +
			pfd.shortTitle( titles[0] ) +
			(titles.length === 1
				? '" (não há mais páginas'
				: '" (há ' + (titles.length - 1) +
					(titles.length === 2
						? ' outra página'
						: ' outras páginas'
					)
			) + ' na lista).'
	);
	current = titles.shift();
	$.get(
		// Do not use mw.util.getUrl until [[phab:T123062]] is fixed
		mw.config.get( 'wgScript' ) + '?' + $.param( {
			title: current,
			action: 'render'
		} ),
		function ( pageHTML ) {
			if ( titles.length === 0 ) {
				pfd.$calendar
					.datepicker( 'enable' )
					.datepicker( 'refresh' );
				$.removeSpinner('pfd');
				pfd.$info.empty();
			} else {
				pfd.parse( titles );
			}
			pfd.show( pageHTML, current );
		}
	);
};

pfd.filter = function ( date ) {
	var	today = $.datepicker.formatDate('yymmdd', pfd.getUTCDate() );
	pfd.selectedDate = date || mw.util.getParamValue('data') || today;
	pfd.selectedPages = [];
	/*jslint unparam: true*/
	$.each(pfd.allPages, function (i, page) {
		if ( page.sortkeyprefix === pfd.selectedDate ) {
			pfd.selectedPages.push( page.title );
		}
	});
	/*jslint unparam: false*/
	pfd.numberOfPagesToShow = pfd.selectedPages.length;
	if ( pfd.numberOfPagesToShow === 0 ) {
		pfd.$info.html(
			'Nenhuma das votações de páginas propostas para eliminação termina em ' +
				$.datepicker.formatDate(
					'dd/mm/yy',
					$.datepicker.parseDate('yymmdd', pfd.selectedDate)
				)  + '.'
		);
		pfd.$calendar
			.datepicker( 'enable' )
			.datepicker( 'refresh' );
		$.removeSpinner('pfd');
		return;
	}
	pfd.$info.html(
		'Obtendo o conteúdo de ' + pfd.selectedPages.length +
			(pfd.selectedPages.length !== 1 ? ' propostas' : ' proposta' ) + ' de eliminação...'
	);
	pfd.getDataForTOC( pfd.selectedPages );
	pfd.parse( pfd.selectedPages );
};

pfd.beforeShowDay = function ( date ) {
	var pages;
	if ( typeof pfd.total === 'undefined' ) {
		return [ true, '' ];
	}
	pages = pfd.total[ $.datepicker.formatDate('yymmdd', date) ];
	return [
		typeof pages !== 'undefined' && pages !== 0, // Enabled on days with at least one page
		pages === pfd.orderedTotals[0] // Is it the day with most pages?
			? 'top-1'
			: pages === pfd.orderedTotals[1]
				? 'top-2'
				: '',
		pages
			? pages + (pages !== 1 ? ' votações terminam' : ' votação termina' ) + ' neste dia'
			: 'Nenhuma votação termina neste dia'
	];
};

pfd.analyseAndFilterCategory = function ( data ) {
	var reDays = /\d+ de (?:(?:jan|fever)eiro|março|abril|maio|ju[nl]ho|agosto|(?:outu|(?:set|nov|dez)em)bro)$/g;
	pfd.total = {};
	pfd.allPages = $.grep( data.query.categorymembers, function (n) {
		if ( reDays.test( n.title ) ) {
			// This is a page from old system, and is not used for voting
			return false;
		}
		if ( typeof pfd.total[ n.sortkeyprefix ] === 'undefined' ) {
			pfd.total[ n.sortkeyprefix ] = 1;
		} else {
			pfd.total[ n.sortkeyprefix ]++;
		}
		return true;
	});
	// Get quantities, discarding the dates
	pfd.orderedTotals = $.map( pfd.total, function ( quantity /*, date */ ) {
		return quantity;
	}).sort(function (a, b) {
		return b - a; // Descending order
	});

	if ( mw.config.get('wgPageName') === 'Wikipédia:Páginas_para_eliminar/Lista' ) {
		pfd.$calendar
			.datepicker( 'disable' )
			.datepicker( 'refresh' );
		pfd.filter();
	} else {
		pfd.$target.empty();
		pfd.$info.empty();
		pfd.$calendar.datepicker( 'refresh' );
		$.removeSpinner('pfd');
	}
};

pfd.run = function () {
	var	cat = 'Categoria:!Itens propostos para eliminação',
		urlDate = mw.util.getParamValue('data');
	pfd.api = new mw.Api({
		ajax: {
			err: function ( code, result ) {
				var	msg = 'Houve um erro ao usar a API (code=' + code +
						', exception=' + result.exception +
						', textStatus=' + result.textStatus + '). ',
					date = $.datepicker.parseDate('yymmdd', pfd.selectedDate),
					months = [
						'janeiro', 'fevereiro', 'março',
						'abril', 'maio', 'junho',
						'julho', 'agosto', 'setembro',
						'outubro', 'novembro', 'dezembro'
					],
					cat;
				if (pfd.selectedDate) {
					cat = 'Categoria:Itens candidatos à eliminação/' +
						$.datepicker.formatDate( 'dd', date ) + ' de ' +
						months[ parseInt( $.datepicker.formatDate( 'm', date ), 10 ) - 1 ];
					msg += 'Tente novamente ou utilize a <a href="' +
						mw.util.getUrl(cat) + '">' + cat +
						'</a> enquanto o problema persistir.';
				}
				pfd.$info.html( msg );
				pfd.$calendar
					.datepicker( 'enable' )
					.datepicker( 'refresh' );
				$.removeSpinner('pfd');
			}
		}
	});
	pfd.$target = $('#pfd-content');
	if ( pfd.$target.length === 0 ) {
		pfd.$info = $('<div id="pfd-info"></div>');
		pfd.$toc = $('<div id="custom-toc"></div>');
		pfd.$target = $( '<div id="pfd-content"></div>' ).appendTo(
			mw.util.$content.find('.mw-content-ltr').first()
		).after( pfd.$info ).before( pfd.$toc );
	}
	pfd.$info.injectSpinner('pfd');
	pfd.$info.html( 'Consultando a <a href="' + mw.util.getUrl(cat) + '">' + cat + '</a>...' );
	pfd.api.get( {
		action: 'query',
		list: 'categorymembers',
		cmnamespace: 4,
		cmtitle: cat,
		cmprop: 'title|sortkeyprefix',
		cmlimit: 500,
		cmsort: 'sortkey'
	} ).done( pfd.analyseAndFilterCategory );
	mw.util.addCSS('#calendar .ui-datepicker {margin: 0 auto;} .top-1 { background-color: #f66; } .top-2 { background-color: #ff6; }');
	pfd.$calendar = $('#calendar').empty();
	pfd.$calendar.datepicker({
		onSelect: function (dateText /*, inst */ ) {
			var	date = $.datepicker.parseDate('dd/mm/yy', dateText),
				formattedDate = $.datepicker.formatDate('yymmdd', date );
			if ( mw.config.get('wgPageName') === 'Wikipédia:Páginas_para_eliminar/Lista' ) {
				pfd.$calendar
					.datepicker( 'disable' )
					.datepicker( 'refresh' );
				pfd.$target.empty();
				pfd.$toc.empty();
				pfd.$info.injectSpinner('pfd');
				pfd.filter( formattedDate );
			} else {
				location.href = mw.util.getUrl( 'Wikipédia:Páginas para eliminar/Lista' ) +
					'?data=' + formattedDate;
			}
		},
		beforeShowDay: pfd.beforeShowDay,
		defaultDate: pfd.getUTCDate()
	});
	if ( urlDate ) {
		pfd.$calendar.datepicker('setDate', $.datepicker.parseDate('yymmdd', urlDate) );
	}
};

if ( $.inArray( mw.config.get('wgAction'), ['view', 'purge'] ) !== -1 ) {
	$(function () {
		if ( $('#pe-header').length !== 0 ) {
			mw.loader.using([
				'mediawiki.api',
				'jquery.spinner',
				'jquery.ui',
				'jquery.tablesorter'
			], pfd.run);
		}
	});
}

} // typeof pfd

}( jQuery, mediaWiki ) );

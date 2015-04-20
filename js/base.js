$(function(){

	var container = document.getElementById('datainput'), hot;
	var data = [] ;
	var headerTitles = ["x<sub>i</sub>","&fnof; (x<sub>i</sub>)"];
	var N = 6;
	var line = [];
	var columns_attr = [];

	for (var i = 0 ; i <=N; ++i) {
		line[line.length] = "";
	}

	data[data.length]= line;
	columns_attr[0] = {type:'numeric','format':'0.[000]'};
	columns_attr[columns_attr.length]=columns_attr[0];
	for (var i = 1; i < N; ++i) {
		headerTitles[headerTitles.length] = "&fnof;<sup>("+i+")</sup> (x<sub>i</sub>)";
		columns_attr[columns_attr.length]=columns_attr[0];
	}

	hot = new Handsontable(container, {
		data: data,
		minSpareRows: 1,
		colHeaders: headerTitles,
		contextMenu:['row_above', 'row_below', 'remove_row'],
		columns : columns_attr
	});
	function factorial(num)
	{
		var rval=1;
		for (var i = 2; i <= num; ++i)
			rval = rval * i;
		return rval;
	}
	function get_derivate_fracs(xi,k){
		for (var i = 0, l = data.length; i < l; i ++) {
			var v = data[i];
			if ( (1+k) < v.length ){
				var f = new Fraction(v[0]);
				if ( f.equals(xi) )
				   return (new Fraction(v[1+k]));
			}
		}

		return null;
	}
	function get_derivate(xi,k){
		for (var i = 0, l = data.length; i < l; i ++) {
			var v = data[i];
			if ( (1+k) < v.length && v[0] === xi ){
			   return v[1+k];
			}
		}

		return null;
	}
	function clamp(num, precision){

		var result = num;
		var q = Math.pow(10,precision);

		result *= q; 
		result = Math.floor(result);

		result /= q;

		return result;

	}

	function calc_with_fractions(ot){
		ot.html("Calculating with fractions...");

		var drv_cnt = data[0].length;
		var coli = 2;
		var rowi = 1; 
		var results = [];
		console.log("Input");
		console.log(data);

		for (var i = 0, l = data.length-1; i < l; ++i) {
			var num = data[i][0];
			console.log("Eval isNull:"+ (num === null));
			console.log("Eval isEmptyString:"+ (num === ""));
			console.log("Eval isNaN:"+ isNaN(num) );
			if ( num === null || num === "" || isNaN(num) ){
				ot.html("Error: x check Not a number: "
						+ num 
						+ " at ("+i+","+0+")");
				return;
			}
			
			 num = data[i][1];

			if ( num === null || num === "" || isNaN(num) ){
				ot.html("Error: f(x) check. Not a number: "
						+ num 
						+ " at ("+i+","+1+")");
				return;
			
			}
			for(var j = 2; j < data[i].length; ++j){
		          num = data[i][j];
			  if ( isNaN(num) ){
				  ot.html("Error: Multiplicit check. Not a number:"
			  	  + num + " at ("+i+","+j+")");
				return;
			  }
			  if( num === null || num === "")
			    break;

			  results[results.length] = [ new Fraction(data[i][0]), new Fraction(data[i][1]) ]; 		
			}

			  results[results.length] = [ new Fraction(data[i][0]) , new Fraction(data[i][1]) ]; 		
			
		}
		console.log("Starting...")
		console.log(results);
		do {
			for (var i = rowi, l = results.length; i < l; ++i) {

				var xdiff = results[i][0].subtract(results[i-coli+1][0]);	
			      	console.log("xdiff="+xdiff);
				var dd; //divided difference

				if(xdiff.equals(0.0) ){

					var drv = get_derivate_fracs(results[i][0],coli-1);
					console.log("Calculating OD by derivate = "
					+ drv 
					+ ", coli="+coli);


					if (drv === null || drv === "" ){
						ot.html("Error: Derivate check. Not a number: "
						+ drv 
						+ " at ("+i+","+(coli+1)+")");
						return;
					}
					dd = drv.divide( factorial(coli-1) );

					}else{

						console.log("Calculating OD:("
						+results[i][coli-1] 
						+ " - "
						+ results[i-1][coli-1] 
						+ ") / " + xdiff);
						dd = results[i][coli-1].subtract( results[i-1][coli-1]);
						dd = dd.divide( xdiff );

					}
					results[i][coli] = dd;
				}

			++coli;
			rowi = coli - 1;
		} while ( rowi < results.length);
		console.log("Done.");
		console.log(results);
		var output_html;
		if ( results[0].length == 0 ){
			ot.html('Nothing to show!');
			return;
		}

	        output_html = "<table id=\"tableoutput\"> <tr><th>x<sub>i</sub></th><th>&fnof; (x<sub>i</sub>)</th>";
		for (var i = 1; i < results[results.length-1].length-1 ; ++i) {
			var inner_str = "";
			for (var j = 0; j <= i; ++j) {
				if ( inner_str != "") 
				    inner_str += ",";
				inner_str +="x<sub>"+j+"</sub>";
			}
		  output_html += "<th>&fnof;["+inner_str+"]</th>" ;
		}	  
		output_html += "</tr>";
		for (var i = 0, l = results.length; i < l; i ++) {
			var v = results[i];
			output_html += "<tr>";
	  		var j = 0;
			for (var l2 = results[i].length; j < l2; j ++) {
			  output_html += "<td>" +results[i][j].toString()+ "</td>"
			}
	  		for( ; j < results[results.length-1].length; ++j ){
	  		  output_html += "<td></td>";
	  		}
			output_html += "</tr>";


		}

		output_html += "</table>";
	        console.log(output_html);
		ot.html(output_html);
		$("#lbOutputDS").css("visibility","visible");

	}
        function calc(ot){
		ot.html("Calculating...");

		var drv_cnt = data[0].length;
		var coli = 2;
		var rowi = 1; 
		var results = [];
		console.log("Input");
		console.log(data);

		for (var i = 0, l = data.length-1; i < l; ++i) {
			var num = data[i][0];
			console.log("Eval isNull:"+ (num === null));
			console.log("Eval isEmptyString:"+ (num === ""));
			console.log("Eval isNaN:"+ isNaN(num) );
			if ( num === null || num === "" || isNaN(num) ){
				ot.html("Error: x check Not a number: "
						+ num 
						+ " at ("+i+","+0+")");
				return;
			}
			
			 num = data[i][1];

			if ( num === null || num === "" || isNaN(num) ){
				ot.html("Error: f(x) check. Not a number: "
						+ num 
						+ " at ("+i+","+1+")");
				return;
			
			}
			for(var j = 2; j < data[i].length; ++j){
		          num = data[i][j];
			  if ( isNaN(num) ){
				  ot.html("Error: Multiplicit check. Not a number:"
			  	  + num + " at ("+i+","+j+")");
				return;
			  }
			  if( num === null || num === "")
			    break;

			  results[results.length] = [ data[i][0], data[i][1] ]; 		
			}

			  results[results.length] = [ data[i][0], data[i][1] ]; 		
			
		}
		console.log("Starting...")
		console.log(results);
		do {
			for (var i = rowi, l = results.length; i < l; ++i) {

				var xdiff = results[i][0] - results[i-coli+1][0];	
			      	console.log("xdiff="+xdiff);
				var dd; //divided difference

				if(xdiff === 0.0 ){

					var drv = get_derivate(results[i][0],coli-1);
					console.log("Calculating OD by derivate = "
					+ drv 
					+ ", coli="+coli);


					if (drv === null || drv === "" || isNaN(drv) ){
						ot.html("Error: Derivate check. Not a number: "
						+ drv 
						+ " at ("+i+","+(coli+1)+")");
						return;
					}
					dd = drv / factorial(coli-1) ;

					}else{

						console.log("Calculating OD:("
						+results[i][coli-1] 
						+ " - "
						+ results[i-1][coli-1] 
						+ ") / " + xdiff);
						dd = results[i][coli-1] - results[i-1][coli-1];
						dd /= xdiff;

					}
					results[i][coli] = dd;
				}

			++coli;
			rowi = coli - 1;
		} while ( rowi < results.length);
		console.log("Done.");
		console.log(results);
		var output_html;
		if ( results[0].length == 0 ){
			ot.html('Nothing to show!');
			return;
		}

	        output_html = "<table id=\"tableoutput\"> <tr><th>x<sub>i</sub></th><th>&fnof; (x<sub>i</sub>)</th>";
		for (var i = 1; i < results[results.length-1].length-1 ; ++i) {
			var inner_str = "";
			for (var j = 0; j <= i; ++j) {
				if ( inner_str != "") 
				    inner_str += ",";
				inner_str +="x<sub>"+j+"</sub>";
			}
		  output_html += "<th>&fnof;["+inner_str+"]</th>" ;
		}	  
		output_html += "</tr>";
		for (var i = 0, l = results.length; i < l; i ++) {
			var v = results[i];
			output_html += "<tr>";
	  		var j = 0;
			for (var l2 = results[i].length; j < l2; j ++) {
			  output_html += "<td>" +results[i][j]+ "</td>"
			}
	  		for( ; j < results[results.length-1].length; ++j ){
	  		  output_html += "<td></td>";
	  		}
			output_html += "</tr>";


		}

		output_html += "</table>";
	        console.log(output_html);
		ot.html(output_html);
		$("#lbOutputDS").css("visibility","visible");

		
	}	 
	$("#btnCalc").click(function(e){

		var ot = $("#dataoutput");

		if ( data.length == 0 ){
			$("#lbOutputDS").css("visibility","hidden");
			ot.html('<strong>Error: No data!</strong>');
			return;
		}
		if( $("#chbxUseFractions").prop("checked") ){
			calc_with_fractions(ot);
		}else{
		     calc(ot);
		}

	});
});


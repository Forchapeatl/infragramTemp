
function changeResolution(w, h){
	document.getElementById('image').setAttribute("width",w);
	document.getElementById('image').setAttribute("height",h);

}
$('#qvga').click(function(e){
	changeResolution('100px','100px')
})
$('#vga').click(function(e){
	changeResolution('800px','600px')
})
$('#hd').click(function(e){
	changeResolution('2400px','1800px')
})
$('#full-hd').click(function(e){
	changeResolution('6000px','4000px')
})
//$("#qvga").click(changeResolution('200px','100px'));
/*
$("#vga").click = changeResolution('800px','600px');
$("#hd").click = changeResolution('2400px','1800px');
$("#full-hd").click = changeresolution('6000px','4000px');*/


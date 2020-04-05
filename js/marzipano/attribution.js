function attribution(first, second, url, position) {

  position = position || 'bottomleft';

  var linkElement = document.createElement('a');
  linkElement.href = url;
  linkElement.target = '_blank';
  linkElement.style.pointerEvents
  linkElement.style.display = 'block';
  linkElement.style.position = 'absolute';
  linkElement.style.left = /left/.test(position) ? '10px' : 'auto';
  linkElement.style.right = /right/.test(position) ? '10px' : 'auto';
  linkElement.style.top = /top/.test(position) ? '10px' : 'auto';
  linkElement.style.bottom = /bottom/.test(position) ? '10px' : 'auto';
  linkElement.style.fontFamily = 'Helvetica, Arial, sans-serif';
  linkElement.style.textAlign = /right/.test(position) ? 'right' : 'left';
  linkElement.style.textTransform = 'uppercase';
  linkElement.style.textDecoration = 'none';
  linkElement.style.color = '#fff';
  linkElement.style.opacity = '0.8';

  var firstElement = document.createElement('div');
  firstElement.innerHTML = first;
  firstElement.style.fontSize = '11px';
  firstElement.style.marginBottom = '4px';

  var secondElement = document.createElement('div');
  secondElement.innerHTML = second;
  secondElement.style.fontSize = '16px';

  linkElement.appendChild(firstElement);
  linkElement.appendChild(secondElement);

  document.body.appendChild(linkElement);
}

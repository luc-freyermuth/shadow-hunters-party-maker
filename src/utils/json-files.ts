export function downloadJson(object: any, filename: string): void {
  const blob = new Blob([JSON.stringify(object)], { type: 'text/plain;charset=utf-8' });

  var url = window.URL || window.webkitURL;
  var a = document.createElement('a');
  a.download = filename + '.json';
  a.href = url.createObjectURL(blob);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function readJsonFromFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = event => {
      try {
        const parsedObject = JSON.parse(event.target.result as string);
        resolve(parsedObject);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = event => {
      reject(new Error('Error while reading file'));
    };
  });
}

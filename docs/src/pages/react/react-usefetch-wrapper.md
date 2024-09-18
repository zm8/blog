# React useFetch 封装

```ts
function useFetch(url: string, options: FetchOptions) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    fetch(url, options)
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) {
          setIsLoading(false);
          setData(data);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(true);
          setIsLoading(false);
        }
      });
    return () => {
      isCancelled = true;
      setIsLoading(false);
    };
  }, [url, options]);

  return { data, isLoading, error };
}
```

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

import { GET_ME } from '../queries/queries';
import { REMOVE_BOOK } from '../mutations/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  const [userData, setUserData] = useState({});
  const { loading, error, data } = useQuery(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK);

  // Update user data when the query result changes
  useEffect(() => {
    if (data && data.me) {
      setUserData(data.me);
    }
  }, [data]);

  // Handle deleting a book
  const handleDeleteBook = async (bookId) => {
    const token = Auth.getToken();

    try {
      const { data } = await removeBook({
        variables: { bookId }
      });

      setUserData(data.removeBook);
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>Error: {error.message}</h2>;

  return (
    <>
      <div fluid className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md="4">
                <Card key={book.bookId} border='dark'>
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
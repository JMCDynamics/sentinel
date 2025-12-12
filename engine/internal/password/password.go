package password

import (
	"crypto/rand"
	"math/big"

	"golang.org/x/crypto/bcrypt"
)

func Hash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return "", err
	}

	return string(bytes), nil
}

func Compare(hash, password string) bool {
	err := bcrypt.CompareHashAndPassword(
		[]byte(hash),
		[]byte(password),
	)
	return err == nil
}

func RandomPlaintextPassword() (string, error) {
	const passwordLength = 12
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/`~"

	b := make([]byte, passwordLength)

	for i := range b {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", err
		}
		b[i] = charset[n.Int64()]
	}

	return string(b), nil
}

CREATE TABLE funcionario (
  cod_acesso INT,
  nome VARCHAR(45),
  status SMALLINT NOT NULL,
  cargo VARCHAR(45) NOT NULL,
  CONSTRAINT pk_funcionario PRIMARY KEY(cod_acesso)
 );


INSERT INTO funcionario VALUES (1, 'Pedro', 1, 'gerente');
INSERT INTO funcionario VALUES (2, 'Flavia', 2, 'caixa');
INSERT INTO funcionario VALUES (3, 'Gabriela', 3, 'estoquista');

CREATE TABLE cliente (
  cpf VARCHAR(11) NOT NULL,
  nome VARCHAR(100),
  endereco VARCHAR(100),
  CONSTRAINT pk_cliente PRIMARY KEY(cpf)
 );
 
INSERT INTO cliente VALUES ('12345678', 'Joao', 'R. das Margaridas, 879');
INSERT INTO cliente VALUES ('78498372', 'Jose', 'R. Rosa, 820');
INSERT INTO cliente VALUES ('45453499', 'Gabriel', 'R. Clara, 756');



CREATE TABLE venda (
  codigovenda INT NOT NULL,
  valor INT NOT NULL,
  data DATE NOT NULL,
  atendente INT NOT NULL,
  funcionario_cod_acesso INT NOT NULL,
  cliente_cpf VARCHAR(11) NOT NULL,
  status VARCHAR,
    CONSTRAINT pk_venda PRIMARY KEY(codigovenda),
  CONSTRAINT fk_venda_funcionario FOREIGN KEY (funcionario_cod_acesso)
    REFERENCES funcionario (cod_acesso)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_venda_cliente1 FOREIGN KEY (cliente_cpf) REFERENCES cliente (cpf)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

INSERT INTO venda VALUES (1, 20, '2022/11/26', 14, 2, '12345678', 'finalizada');
INSERT INTO venda VALUES (2, 30, '2022/11/27', 19, 2, '78498372', 'finalizada');
INSERT INTO venda VALUES (3, 15, '2022/11/28', 10, 2, '45453499', 'finalizada');
INSERT INTO venda VALUES(4, 68, '2022-10-05', 1, 1, '45453499', 'finalizada');
INSERT INTO venda VALUES(5, 73, '2022-10-05', 1, 1, '45453499', 'finalizada');
INSERT INTO venda VALUES(6, 0, '2022-10-05', 1, 1, '45453499', 'aberta');


CREATE TABLE pagamento (
  valor INT NOT NULL,
  tipo VARCHAR(45) NOT NULL,
  venda_codigovenda INT NOT NULL,
   CONSTRAINT pk_pagamento PRIMARY KEY (venda_codigovenda),
  CONSTRAINT fk_pagamento_venda1 FOREIGN KEY (venda_codigovenda)
    REFERENCES venda (codigovenda)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);


INSERT INTO pagamento VALUES (20, 'Pix', 1);
INSERT INTO pagamento VALUES (16, 'Dinheiro', 2);
INSERT INTO pagamento VALUES (330, 'Cartao', 3);


CREATE TABLE produto (
  numproduto INT NOT NULL,
  nome VARCHAR(45),
  valor INT NOT NULL,
  estoque INT,
  categoria VARCHAR(45),
  CONSTRAINT pk_produto PRIMARY KEY (numproduto)
);

INSERT INTO produto VALUES (20, 'Sabao Omo', 10, 5, 'Limpeza');
INSERT INTO produto VALUES (40, 'Nescau', 8, 15, 'Alimento');
INSERT INTO produto VALUES (50, 'Notebook', 300, 1, 'Eletronico');
INSERT INTO produto VALUES(3, 'Veja', 1000, 0, 'limpeza');
INSERT INTO produto VALUES(2, 'Petisco', 5, 15, 'pet');
INSERT INTO produto VALUES(1, 'Batima', 666, 666, 'brinquedo');
INSERT INTO produto VALUES(51, 'Cafézinho', 10, 1, 'cafe');
INSERT INTO produto VALUES(52, 'abc', 12, 1, 'ab');
INSERT INTO produto VALUES(21, 'moto', 5000, 1, 'veiculo');
INSERT INTO produto VALUES(4, 'Batima', 68, 666, 'brinquedo');
INSERT INTO produto VALUES(7, 'Nina', 1500, 1, 'pet');



CREATE TABLE item (
  produto_numproduto INT NOT NULL,
  venda_codigovenda INT NOT NULL,
  quantidade INT NOT NULL,
  valor REAL NOT NULL,
  valor_com_desconto REAL,
  CONSTRAINT pk_item PRIMARY KEY (produto_numproduto, venda_codigovenda),
  CONSTRAINT fk_produto_has_venda_produto1 FOREIGN KEY (produto_numproduto)
    REFERENCES produto (numproduto)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_produto_has_venda_venda1 FOREIGN KEY (venda_codigovenda)
    REFERENCES venda (codigovenda)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

INSERT INTO item VALUES (20, 1, 2, 20.00, 18.00);
INSERT INTO item VALUES (40, 2, 5, 40.00, 36.00);
INSERT INTO item VALUES (50, 3, 1, 300.00, 270.00);
INSERT INTO item VALUES(1, 3, 2, 136.0, 0.0);
INSERT INTO item VALUES(1, 4, 10, 680.0, 0.0);
INSERT INTO item VALUES(2, 5, 1, 5.0, 0.0);
INSERT INTO item VALUES(1, 5, 4, 136.0, 0.0);
INSERT INTO item VALUES(7, 6, 1, 1500.0, 0.0);




CREATE TABLE fornecedor (
  cnpj INT NOT NULL,
  nome VARCHAR(45),
  endereco VARCHAR(100),
  CONSTRAINT pk_fornecedor PRIMARY KEY (cnpj)
);


INSERT INTO fornecedor VALUES (4712100, 'Juacyr', 'R. CA, 10');


CREATE TABLE lote (
  numerocompra INT NOT NULL,
  valor INT NOT NULL,
  data DATE NOT NULL,
  funcionario_cod_acesso INT NOT NULL,
  fornecedor_cnpj INT NOT NULL,
  CONSTRAINT pk_lote PRIMARY KEY (numerocompra),
  CONSTRAINT fk_lote_funcionario1 FOREIGN KEY (funcionario_cod_acesso) REFERENCES funcionario (cod_acesso)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_lote_fornecedor1 FOREIGN KEY (fornecedor_cnpj) REFERENCES fornecedor (cnpj)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);


INSERT INTO lote VALUES (1, 3000,'2022/08/09', 3, 4712100);
INSERT INTO lote VALUES (2, 400,'2022/09/24', 3, 4712100);
INSERT INTO lote VALUES (3, 200,'2022/10/13', 3, 4712100);
INSERT INTO lote VALUES(4, 100, '2022-11-18', 1, 4712100);


CREATE TABLE pertence (
  lote_numerocompra INT NOT NULL,
  produto_numproduto INT NOT NULL,
  CONSTRAINT pk_pertence PRIMARY KEY (lote_numerocompra, produto_numproduto),
  CONSTRAINT fk_lote_has_produto_lote1 FOREIGN KEY (lote_numerocompra)
  REFERENCES lote (numerocompra)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
  CONSTRAINT fk_lote_has_produto_produto1 FOREIGN KEY (produto_numproduto)
    REFERENCES produto (numproduto)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);


INSERT INTO pertence VALUES (1, 20);
INSERT INTO pertence VALUES (2, 40);
INSERT INTO pertence VALUES (3, 50);


CREATE TABLE promocao (
  produto_numproduto INT NOT NULL,
  funcionario_cod_acesso INT NOT NULL,
  data DATE NOT NULL,
  desconto REAL NULL,
  CONSTRAINT pk_promocao PRIMARY KEY (produto_numproduto, funcionario_cod_acesso),
  CONSTRAINT fk_produto_has_funcionario_produto1 FOREIGN KEY (produto_numproduto)
    REFERENCES produto (numproduto)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_produto_has_funcionario_funcionario1
    FOREIGN KEY (funcionario_cod_acesso)
    REFERENCES funcionario (cod_acesso)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

INSERT INTO promocao VALUES (20, 1, '2022/11/26', 2.00);
INSERT INTO promocao VALUES (40, 1, '2022/11/27', 4.00);
INSERT INTO promocao VALUES (50, 1, '2022/11/28', 30.00);

CREATE TABLE altera(
  item_produto_numproduto INT NOT NULL,
  item_venda_codigovenda INT NOT NULL,
  funcionario_cod_acesso INT NOT NULL,
  data VARCHAR(45),
  tipo VARCHAR(45),
  CONSTRAINT pk_altera PRIMARY KEY (item_produto_numproduto, item_venda_codigovenda, funcionario_cod_acesso),
  CONSTRAINT fk_item_has_funcionario_item1 FOREIGN KEY (item_produto_numproduto, item_venda_codigovenda)
    REFERENCES item (produto_numproduto, venda_codigovenda)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_item_has_funcionario_funcionario1 FOREIGN KEY (funcionario_cod_acesso)
    REFERENCES funcionario (cod_acesso)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);


INSERT INTO altera VALUES (20, 1, 3,'2022/11/26', NULL);
INSERT INTO altera VALUES (40, 2, 3, '2022/11/27', NULL);
INSERT INTO altera VALUES (50, 3, 3, '2022/11/28', NULL);


CREATE TABLE telefone_cliente (
  cliente_cpf VARCHAR(11) NOT NULL,
  telefone VARCHAR(15) NOT NULL,
  tipo VARCHAR(15) NOT NULL,
  CONSTRAINT pk_telefone_cliente PRIMARY KEY (cliente_cpf, telefone), 
  CONSTRAINT fk_telefone_cliente_cliente1 FOREIGN KEY (cliente_cpf) REFERENCES cliente (cpf)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

INSERT INTO telefone_cliente VALUES ('12345678', '999457642', 'Pessoal');
INSERT INTO telefone_cliente VALUES ('78498372', '32484739', 'Residencial');
INSERT INTO telefone_cliente VALUES ('45453499', '985645645', 'Pessoal');

CREATE TABLE telefone_fornecedor (
  fornecedor_cnpj INT NOT NULL,
  telefone VARCHAR(15) NOT NULL,
  tipo VARCHAR(15) NOT NULL,
  CONSTRAINT pk_telefone_fornecedor PRIMARY KEY (fornecedor_cnpj, telefone),
  CONSTRAINT fk_telefone_fornecedor_fornecedor1 FOREIGN KEY (fornecedor_cnpj)
  REFERENCES fornecedor (cnpj)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION
);

INSERT INTO telefone_fornecedor VALUES (4712100, '32874635', 'Residencial');


CREATE TABLE telefone_funcionario (
  funcionario_cod_acesso INT NOT NULL,
  telefone VARCHAR(15) NOT NULL,
  tipo VARCHAR(15) NOT NULL,
  CONSTRAINT pk_telefone_funcionario PRIMARY KEY (funcionario_cod_acesso, telefone),
  CONSTRAINT fk_telefone_funcionario_funcionario1 FOREIGN KEY (funcionario_cod_acesso)
  REFERENCES funcionario (cod_acesso)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION
);

INSERT INTO telefone_funcionario VALUES (1, '998483210', 'Pessoal');
INSERT INTO telefone_funcionario VALUES (2, '983242343', 'Pessoal');
INSERT INTO telefone_funcionario VALUES (3, '32738020', 'Residencial');

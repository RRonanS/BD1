function Produto(){
    this.id, this.nome, this.descricao, this.preco, this.categoria;
    this.set_nome = function(nome){
        this.nome = nome;
    }
    this.set_desc = function(desc){
        this.descricao = desc;
    }
    this.set_preco = function(prec){
        this.preco = prec;
    }
    this.set_categoria = function(cat){
        this.categoria = cat;
    }
    this.set_id = function(id){
        this.id = id;
    }
    this.get_nome = function(){return this.nome;}
    this.get_id = function(){return this.id;}
    this.get_categoria = function(){return this.categoria;}
    this.get_preco = function(){return this.preco;}
    this.get_desc = function(){return this.descricao;}
}

module.exports = Produto;
